import axios from 'axios';

// =======================================================================
// HELPER FUNCTIONS
// =======================================================================
const generateRandomId = (length = 19) => {
    let result = '';
    result += Math.floor(Math.random() * 9) + 1; 
    for (let i = 1; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
};

const generateOpenUdid = () => {
    return 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        return (Math.random() * 16 | 0).toString(16);
    });
};

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const CONFIG = {
    BASE_URL: "https://api.tmtreader.com",
    HEADERS: {
        "Host": "api.tmtreader.com",
        "Accept": "application/json; charset=utf-8,application/x-protobuf",
        "X-Xs-From-Web": "false",
        "Age-Range": "8",
        "Sdk-Version": "2",
        "Passport-Sdk-Version": "50357",
        "X-Vc-Bdturing-Sdk-Version": "2.2.1.i18n",
        "User-Agent": "ScRaPe/9.9 (KaliLinux; Nusantara Os; My/Shannz)" 
    },
    COMMON_PARAMS: {
        "iid": generateRandomId(19),
        "device_id": generateRandomId(19),
        "ac": "wifi",
        "channel": "gp",
        "aid": "645713",
        "app_name": "Melolo",
        "version_code": "49819",
        "version_name": "4.9.8",
        "device_platform": "android",
        "os": "android",
        "ssmix": "a",
        "device_type": "ScRaPe",
        "device_brand": "Shannz",
        "language": "in",
        "os_api": "28",
        "os_version": "15",
        "openudid": generateOpenUdid(),
        "manifest_version_code": "49819",
        "resolution": "900*1600",
        "dpi": "320",
        "update_version_code": "49819",
        "current_region": "ID",
        "carrier_region": "ID",
        "app_language": "id",
        "sys_language": "in",
        "app_region": "ID",
        "sys_region": "ID",
        "mcc_mnc": "46002",
        "carrier_region_v2": "460",
        "user_language": "id",
        "time_zone": "Asia/Jakarta",
        "ui_language": "in",
        "cdid": generateUUID(),
    }
};

// KEMBALIKAN KE MICROSECONDS AGAR TIDAK DITOLAK SERVER
const generateRticket = () => {
    return String(Math.floor(Date.now() * 1000) + Math.floor(Math.random() * 1000));
};

const request = async (method, endpoint, params = {}, data = null, customHeaders = {}) => {
    try {
        const url = `${CONFIG.BASE_URL}${endpoint}`;
        const finalParams = {
            ...CONFIG.COMMON_PARAMS,
            ...params,
            "_rticket": generateRticket()
        };
        const config = {
            method,
            url,
            headers: { ...CONFIG.HEADERS, ...customHeaders },
            params: finalParams
        };

        if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    } catch (error) {
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        throw new Error(`Melolo API Error: ${errorMsg}`);
    }
};

// FUNGSI DECODE YANG LEBIH AMAN
const decodeUrl = (str) => {
    if (!str) return null;
    if (typeof str !== 'string') return str;
    if (str.startsWith('http')) return str;
    try {
        const decoded = Buffer.from(str, 'base64').toString('utf-8');
        if (decoded.startsWith('http')) return decoded;
    } catch (e) {}
    return str; 
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
                        let imageUrl = book.thumb_url || book.cover_url || book.cover || book.pic_url || book.book_cover || '';
                        if (Array.isArray(imageUrl)) imageUrl = imageUrl[0];
                        if (typeof imageUrl === 'string' && imageUrl.trim() !== '') {
                            imageUrl = imageUrl.replace(/\.heic/gi, '.png');
                        }

                        results.push({
                            title: book.book_name,
                            book_id: book.book_id,
                            cover: imageUrl,
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
            "X-Ss-Stub": "238B6268DE1F0B757306031C76B5397E",
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
        const episodes = videoList.map(v => ({
            video_id: v.vid,
            episode: v.vid_index,
            title: v.title,
            duration: v.duration,
            likes: v.digged_count,
            cover: v.cover ? v.cover.replace(/\.heic/gi, '.png') : v.cover
        }));
        
        return {
            book_id: data.series_id_str || bookId,
            title: data.series_title,
            intro: data.series_intro,
            cover: data.series_cover ? data.series_cover.replace(/\.heic/gi, '.png') : data.series_cover,
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
            "X-Ss-Stub": "B7FB786F2CAA8B9EFB7C67A524B73AFB",
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
            url: decodeUrl(raw.main_url),
            backup_url: decodeUrl(raw.backup_url),
            expire_at: raw.expire_time,
            width: raw.video_width,
            height: raw.video_height,
            metadata: {},
            downloads: []
        };
        
        try {
            if (raw.video_model) {
                const model = typeof raw.video_model === 'string' ? JSON.parse(raw.video_model) : raw.video_model;
                const thumbs = model.big_thumbs || [];
                result.metadata = {
                    id: model.video_id,
                    duration: model.video_duration,
                    thumbnail: thumbs.length > 0 ? thumbs[0].img_url : null
                };
                
                if (model.video_list) {
                    Object.values(model.video_list).forEach(item => {
                        let videoUrl = decodeUrl(item.main_url) || decodeUrl(item.main_play_url);
                        if (videoUrl) {
                            result.downloads.push({
                                quality: item.definition,
                                size: item.size,
                                fps: item.fps,
                                vcodec: item.vcodec || item.codec_type || '', // Ambil info codec
                                url: videoUrl
                            });
                        }
                    });

                    // PRIORITAS: Utamakan codec h264 karena h265(bytevc1) sering error di browser
                    result.downloads.sort((a, b) => {
                        const aIsH264 = String(a.vcodec).toLowerCase().includes('h264');
                        const bIsH264 = String(b.vcodec).toLowerCase().includes('h264');
                        
                        if (aIsH264 && !bIsH264) return -1;
                        if (!aIsH264 && bIsH264) return 1;
                        
                        return (b.size || 0) - (a.size || 0);
                    });
                }
            }
        } catch (error) {
            console.error("Error parsing video_model:", error);
            result.status = false;
            result.error = "Failed to parse detailed video model";
        }

        // Fallback jika API tidak memberikan list, tapi main_url tersedia
        if (result.downloads.length === 0 && result.url) {
            result.downloads.
