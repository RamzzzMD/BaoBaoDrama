import axios from 'axios';
import crypto from 'crypto';

const generateRandomId = (length = 19) => {
    let result = '';
    result += Math.floor(Math.random() * 9) + 1;
    for (let i = 1; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
};

const generateOpenUdid = () => {
    return 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16));
};

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const CONFIG = {
  BASE_URL: 'https://api.tmtreader.com',
  HEADERS: {
    'Accept': 'application/json; charset=utf-8,application/x-protobuf',
    'X-Xs-From-Web': 'false',
    'Age-Range': '8',
    'Sdk-Version': '2',
    'Passport-Sdk-Version': '50357',
    'X-Vc-Bdturing-Sdk-Version': '2.2.1.i18n',
    // Bikin User-Agent lebih spesifik mirip aslinya
    'User-Agent': 'com.worldance.drama/49819 (Linux; U; Android 13; in_ID; SM-G991B; Build/TP1A.220624.014; Cronet/TTNetVersion)',
    // Header sakti untuk ngelewatin Shark
    'x-tt-bdturing-version': '2.2.1.i18n',
    'x-tt-bdturing-pop-scene': '1',
    // Dummy cookie odin_tt (sering diminta sama endpoint stream)
    'Cookie': 'odin_tt=324c4731a52003c0032b4927b203170e1c0c20173820061e38100523271131102f2322312b2e113636123403173a1e2f3a21350a2e043003021115160b0c2e39; install_id=7401827361928371928; ttreq=1$64b38fa1583d7f999127814b7e84ab4b6d491f24'
  },
  COMMON_PARAMS: {
    // JANGAN DI-RANDOM LAGI! Gunakan ID statis agar server mengira ini dari HP yang sama.
    iid: '7401827361928371928', 
    device_id: '7394827163829102837',
    ac: 'wifi',
    channel: 'gp',
    aid: '645713',
    app_name: 'Melolo',
    version_code: '49819',
    version_name: '4.9.8',
    device_platform: 'android',
    os: 'android',
    ssmix: 'a',
    device_type: 'SM-G991B',
    device_brand: 'samsung',
    language: 'in',
    os_api: '33', // Sesuaikan dengan Android 13 di User-Agent
    os_version: '13',
    // Biarkan openudid & cdid random nggak masalah, yang penting device_id statis
    openudid: generateOpenUdid(), 
    manifest_version_code: '49819',
    resolution: '1080*2400', // Ukuran layar wajar
    dpi: '480',
    update_version_code: '49819',
    current_region: 'ID',
    carrier_region: 'ID',
    app_language: 'id',
    sys_language: 'in',
    app_region: 'ID',
    sys_region: 'ID',
    mcc_mnc: '51010', // Pake MCC MNC Telkomsel biar lebih legit (awalnya 46002 itu China Mobile)
    carrier_region_v2: '510',
    user_language: 'id',
    time_zone: 'Asia/Jakarta',
    ui_language: 'in',
    cdid: generateUUID()
  }
};

const generateRticket = () => String(Math.floor(Date.now() * 1000) + Math.floor(Math.random() * 1000));

// === PERBAIKAN UTAMA: Generate X-Ss-Stub secara dinamis ===
const generateSsStub = (body) => {
    if (!body) return "D41D8CD98F00B204E9800998ECF8427E"; // MD5 empty
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    return crypto.createHash('md5').update(data).digest('hex').toUpperCase();
};

const request = async (method, endpoint, params = {}, data = null, customHeaders = {}) => {
    try {
        const url = `${CONFIG.BASE_URL}${endpoint}`;
        const finalParams = {
            ...CONFIG.COMMON_PARAMS,
            ...params,
            "_rticket": generateRticket()
        };

        const headers = { 
            ...CONFIG.HEADERS, 
            ...customHeaders 
        };

        // Jika ada body (POST), generate stub baru
        if (data) {
            headers["X-Ss-Stub"] = generateSsStub(data);
        }

        const config = {
            method,
            url,
            headers,
            params: finalParams,
            data,
            timeout: 15000,
        };

        const response = await axios(config);
        return response.data;
    } catch (error) {
        const errorMsg = error.response 
            ? JSON.stringify(error.response.data, null, 2) 
            : error.message;
        console.error(`❌ Melolo API Error [${method} ${endpoint}]:`, errorMsg);
        throw new Error(`Melolo API Error: ${errorMsg}`);
    }
};

const melolo = {
    search: async (query, offset = 0, limit = 10) => {
        const endpoint = '/i18n_novel/search/page/v1/';
        const params = {
            "search_source_id": "clks###",
            "IsFetchDebug": "false",
            "offset": offset,
            "cancel_search_category_enhance": "false",
            "query": query,
            "limit": limit,
            "search_id": ""
        };
        const json = await request('GET', endpoint, params);
        const searchData = json?.data?.search_data || [];
        const results = [];

        if (Array.isArray(searchData)) {
            searchData.forEach(section => {
                if (section.books && Array.isArray(section.books)) {
                    section.books.forEach(book => {
                        // Pastikan gambar bisa diload di browser dengan mengubah .heic ke .png
                        let coverImg = book.thumb_url || '';
                        if (typeof coverImg === 'string') coverImg = coverImg.replace(/\.heic/gi, '.png');

                        results.push({
                            title: book.book_name,
                            book_id: book.book_id,
                            cover: coverImg,
                            author: book.author,
                            sinopsis: book.abstract,
                            status: book.show_creation_status,
                            tags: book.stat_infos || [],
                            total_chapters: book.serial_count || book.last_chapter_index
                        });
                    });
                }
            });
        }
        return results;
    },

    detail: async (bookId) => {
        if (!bookId) throw new Error("Book ID required");
        const endpoint = '/novel/player/video_detail/v1/';
        const headers = {
            "Content-Type": "application/json; charset=utf-8"
        };
        const payload = {
            "biz_param": {
                "detail_page_version": 0,
                "from_video_id": "",
                "need_all_video_definition": false,
                "need_mp4_align": false,
                "source": 4,
                "use_os_player": false,
                "video_id_type": 1
            },
            "series_id": String(bookId)
        };
        const json = await request('POST', endpoint, {}, payload, headers);
        const data = json?.data?.video_data || {};

        let tags = [];
        try {
            if (data.category_schema) {
                const parsed = JSON.parse(data.category_schema);
                tags = parsed.map(cat => cat.name);
            }
        } catch (e) {
            console.warn("Gagal parse category_schema");
        }

        const videoList = data.video_list || [];
        const episodes = videoList.map(v => {
            let epsCover = v.cover || '';
            if (typeof epsCover === 'string') epsCover = epsCover.replace(/\.heic/gi, '.png');
            
            return {
                video_id: v.vid,
                episode: v.vid_index,
                title: v.title,
                duration: v.duration,
                likes: v.digged_count,
                cover: epsCover
            };
        });

        let mainCover = data.series_cover || '';
        if (typeof mainCover === 'string') mainCover = mainCover.replace(/\.heic/gi, '.png');

        return {
            book_id: data.series_id_str || bookId,
            title: data.series_title,
            intro: data.series_intro,
            cover: mainCover,
            total_episodes: data.episode_cnt,
            tags: tags,
            status: data.series_status === 1 ? "Ongoing" : "Completed",
            episodes: episodes
        };
    },

    stream: async (videoId) => {
        if (!videoId) throw new Error("Video ID required");

        const endpoint = '/novel/player/video_model/v1/';
        const headers = {
            "Content-Type": "application/json; charset=utf-8"
        };

        const payload = {
            "biz_param": {
                "detail_page_version": 0,
                "device_level": 3,
                "from_video_id": "",
                "need_all_video_definition": true,
                "need_mp4_align": false,
                "source": 4,
                "use_os_player": false,
                "video_id_type": 0,
                "video_platform": 3
            },
            "video_id": String(videoId)
        };

        const json = await request('POST', endpoint, {}, payload, headers);
        const raw = json?.data || {};

        let result = {
            status: true,
            url: raw.main_url || null,
            backup_url: raw.backup_url || null,
            expire_at: raw.expire_time,
            width: raw.video_width,
            height: raw.video_height,
            metadata: {},
            downloads: []
        };

        try {
            if (raw.video_model) {
                const model = typeof raw.video_model === 'string' 
                    ? JSON.parse(raw.video_model) 
                    : raw.video_model;

                const thumbs = model.big_thumbs || [];
                result.metadata = {
                    id: model.video_id,
                    duration: model.video_duration,
                    thumbnail: thumbs.length > 0 ? thumbs[0].img_url : null
                };

                if (model.video_list) {
                    Object.values(model.video_list).forEach(item => {
                        let videoUrl = item.main_url || item.url;
                        if (videoUrl && !videoUrl.startsWith('http')) {
                            try {
                                videoUrl = Buffer.from(videoUrl, 'base64').toString('utf-8');
                            } catch (err) {
                                console.warn(`Gagal decode URL kualitas ${item.definition}:`, err.message);
                            }
                        }
                        if (videoUrl) {
                            result.downloads.push({
                                quality: item.definition || item.definition_name,
                                size: item.size || 0,
                                fps: item.fps,
                                codec: item.codec_type || item.vcodec || '',
                                url: videoUrl
                            });
                        }
                    });

                    // Sort by size (tertinggi dulu), prioritas H.264
                    result.downloads.sort((a, b) => {
                        const aIsH264 = String(a.codec).toLowerCase().includes('h264');
                        const bIsH264 = String(b.codec).toLowerCase().includes('h264');
                        if (aIsH264 && !bIsH264) return -1;
                        if (!aIsH264 && bIsH264) return 1;
                        return (b.size || 0) - (a.size || 0);
                    });
                }
            } else if (raw.main_url) {
                // Fallback jika video_model kosong tapi main_url ada
                let fallbackUrl = raw.main_url;
                if (!fallbackUrl.startsWith('http')) {
                    try { fallbackUrl = Buffer.from(fallbackUrl, 'base64').toString('utf-8'); } catch(e){}
                }
                
                result.downloads.push({
                    quality: "default",
                    url: fallbackUrl
                });
            }
        } catch (error) {
            console.error("❌ Error parsing video_model:", error.message);
            result.status = false;
            result.error = "Failed to parse detailed video model";
        }

        // Pastikan url utamanya dapet link yang valid dari downloads
        if (result.downloads.length > 0) {
             result.url = result.downloads[0].url;
        }

        if (!result.url && result.downloads.length === 0) {
            result.status = false;
            result.error = "No stream URL found";
        }

        return result;
    }
};

// =======================================================================
// VERCEL SERVERLESS FUNCTION HANDLER
// =======================================================================
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { action, query, bookId, videoId, offset } = req.query;

    try {
        if (action === 'search') {
            const data = await melolo.search(query || 'ceo', parseInt(offset) || 0);
            return res.status(200).json(data);
        }
        if (action === 'detail') {
            if (!bookId) return res.status(400).json({error: "bookId required"});
            const data = await melolo.detail(bookId);
            return res.status(200).json(data);
        }
        if (action === 'stream') {
            if (!videoId) return res.status(400).json({error: "videoId required"});
            const data = await melolo.stream(videoId);
            return res.status(200).json(data);
        }
        return res.status(400).json({error: "Invalid action. Use ?action=search|detail|stream"});
    } catch (error) {
        console.error("Proxy Error:", error);
        return res.status(500).json({error: error.message});
    }
}
