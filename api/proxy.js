import axios from 'axios'
import crypto from 'node:crypto'

const generateRandomId = (length = 19) => {
  let result = `${Math.floor(Math.random() * 9) + 1}`
  for (let i = 1; i < length; i++) result += Math.floor(Math.random() * 10)
  return result
}

const generateOpenUdid = () =>
  'xxxxxxxxxxxxxxxx'.replace(/x/g, () => (Math.random() * 16 | 0).toString(16))

const generateUUID = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })

const md5Upper = value =>
  crypto.createHash('md5').update(value).digest('hex').toUpperCase()

const safeJsonParse = (value, fallback = null) => {
  try {
    if (typeof value === 'string') return JSON.parse(value)
    if (value && typeof value === 'object') return value
    return fallback
  } catch {
    return fallback
  }
}

const decodeMaybeBase64Url = value => {
  if (!value) return null

  if (Array.isArray(value)) {
    for (const item of value) {
      const decoded = decodeMaybeBase64Url(item)
      if (decoded) return decoded
    }
    return null
  }

  if (typeof value !== 'string') return null

  const clean = value.trim()
  if (!clean) return null
  if (/^https?:\/\//i.test(clean)) return clean

  try {
    const decoded = Buffer.from(clean, 'base64').toString('utf8').trim()
    if (/^https?:\/\//i.test(decoded)) return decoded
  } catch {}

  return clean
}

const pickUrl = (...values) => {
  for (const value of values) {
    const url = decodeMaybeBase64Url(value)
    if (url) return url
  }
  return null
}

const CONFIG = {
  BASE_URL: 'https://api.tmtreader.com',
  HEADERS: {
    Accept: 'application/json; charset=utf-8,application/x-protobuf',
    'X-Xs-From-Web': 'false',
    'Age-Range': '8',
    'Sdk-Version': '2',
    'Passport-Sdk-Version': '50357',
    'X-Vc-Bdturing-Sdk-Version': '2.2.1.i18n',
    'User-Agent': 'com.worldance.drama/49819 (Linux; Android 15; ID) Cronet/TTNetVersion'
  },
  COMMON_PARAMS: {
    iid: generateRandomId(19),
    device_id: generateRandomId(19),
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
    os_api: '28',
    os_version: '15',
    openudid: generateOpenUdid(),
    manifest_version_code: '49819',
    resolution: '900*1600',
    dpi: '320',
    update_version_code: '49819',
    current_region: 'ID',
    carrier_region: 'ID',
    app_language: 'id',
    sys_language: 'in',
    app_region: 'ID',
    sys_region: 'ID',
    mcc_mnc: '46002',
    carrier_region_v2: '460',
    user_language: 'id',
    time_zone: 'Asia/Jakarta',
    ui_language: 'in',
    cdid: generateUUID()
  }
}

const generateRticket = () =>
  String(Date.now() + Math.floor(Math.random() * 1000))

const request = async (method, endpoint, params = {}, data = null, customHeaders = {}) => {
  const upperMethod = method.toUpperCase()
  const url = `${CONFIG.BASE_URL}${endpoint}`

  const finalParams = {
    ...CONFIG.COMMON_PARAMS,
    ...params,
    _rticket: generateRticket()
  }

  const headers = {
    ...CONFIG.HEADERS,
    ...customHeaders
  }

  const config = {
    method: upperMethod,
    url,
    headers,
    params: finalParams,
    timeout: 30000,
    validateStatus: status => status >= 200 && status < 300
  }

  if (data && ['POST', 'PUT', 'PATCH'].includes(upperMethod)) {
    const body = typeof data === 'string' ? data : JSON.stringify(data)

    config.data = body
    config.headers['Content-Type'] =
      config.headers['Content-Type'] || 'application/json; charset=utf-8'

    config.headers['X-Ss-Stub'] = md5Upper(body)
  }

  try {
    const response = await axios(config)
    return response.data
  } catch (error) {
    const status = error.response?.status
    const responseData = error.response?.data
    const message = responseData ? JSON.stringify(responseData) : error.message

    throw new Error(
      `Melolo API Error ${status ? `[${status}] ` : ''}${endpoint}: ${message}`
    )
  }
}

export const melolo = {
  search: async (query, offset = 0, limit = 10) => {
    if (!query) throw new Error('Query is required for searching')

    const endpoint = '/i18n_novel/search/page/v1/'
    const params = {
      search_source_id: 'clks###',
      IsFetchDebug: 'false',
      offset,
      cancel_search_category_enhance: 'false',
      query,
      limit,
      search_id: ''
    }

    const json = await request('GET', endpoint, params)
    const searchData = json?.data?.search_data || []
    const results = []

    for (const section of Array.isArray(searchData) ? searchData : []) {
      const books = section?.books || section?.book_list || section?.data || []
      if (!Array.isArray(books)) continue

      results.push(
        ...books.map(book => {
          let coverImg = book.thumb_url || book.cover || book.series_cover || '';
          if (typeof coverImg === 'string') coverImg = coverImg.replace(/\.heic/gi, '.png');

          return {
            title: book.book_name || book.title || 'Unknown',
            book_id: book.book_id || book.series_id || book.series_id_str || null,
            cover: coverImg,
            author: book.author || 'Unknown',
            sinopsis: book.abstract || book.intro || book.series_intro || '',
            status: book.show_creation_status || book.status || '',
            tags: book.stat_infos || book.tags || [],
            total_chapters: book.serial_count || book.last_chapter_index || book.episode_cnt || 0
          }
        })
      )
    }

    return results.filter(item => item.book_id)
  },

  detail: async bookId => {
    if (!bookId) throw new Error('Book ID is required')

    const endpoint = '/novel/player/video_detail/v1/'
    const payload = {
      biz_param: {
        detail_page_version: 0,
        from_video_id: '',
        need_all_video_definition: false,
        need_mp4_align: false,
        source: 4,
        use_os_player: false,
        video_id_type: 1
      },
      series_id: String(bookId)
    }

    const json = await request('POST', endpoint, {}, payload)
    const data = json?.data?.video_data || json?.data || {}

    const parsedCategory = safeJsonParse(data.category_schema, [])
    const tags = Array.isArray(parsedCategory)
      ? parsedCategory.map(cat => cat?.name).filter(Boolean)
      : []

    const videoList = Array.isArray(data.video_list) ? data.video_list : []

    const episodes = videoList
      .map((v, i) => {
        let coverImg = v.cover || v.thumb_url || null;
        if (typeof coverImg === 'string') coverImg = coverImg.replace(/\.heic/gi, '.png');
        
        return {
          video_id: v.vid || v.video_id || v.id || null,
          episode: v.vid_index || v.episode || i + 1,
          title: v.title || `Episode ${v.vid_index || i + 1}`,
          duration: v.duration || null,
          likes: v.digged_count || v.likes || 0,
          cover: coverImg
        }
      })
      .filter(v => v.video_id)

    let mainCover = data.series_cover || data.cover || '';
    if (typeof mainCover === 'string') mainCover = mainCover.replace(/\.heic/gi, '.png');

    return {
      book_id: data.series_id_str || data.series_id || String(bookId),
      title: data.series_title || data.title || 'Unknown',
      intro: data.series_intro || data.intro || '',
      cover: mainCover,
      total_episodes: data.episode_cnt || episodes.length,
      tags,
      status: data.series_status === 1 ? 'Ongoing' : 'Completed',
      episodes
    }
  },

  stream: async videoId => {
    if (!videoId) throw new Error('Video ID is required')

    const endpoint = '/novel/player/video_model/v1/'
    const payload = {
      biz_param: {
        detail_page_version: 0,
        device_level: 3,
        from_video_id: '',
        need_all_video_definition: true,
        need_mp4_align: false,
        source: 4,
        use_os_player: false,
        video_id_type: 0,
        video_platform: 3
      },
      video_id: String(videoId)
    }

    const json = await request('POST', endpoint, {}, payload)
    const raw = json?.data || {}
    const model = safeJsonParse(raw.video_model, null)

    const result = {
      status: false,
      url: pickUrl(raw.main_url, raw.play_url, raw.url),
      backup_url: pickUrl(raw.backup_url),
      expire_at: raw.expire_time || null,
      width: raw.video_width || null,
      height: raw.video_height || null,
      metadata: {},
      downloads: []
    }

    if (!model) {
      result.error = 'No video_model found in response'
      return result
    }

    const thumbs = Array.isArray(model.big_thumbs) ? model.big_thumbs : []

    result.metadata = {
      id: model.video_id || String(videoId),
      duration: model.video_duration || null,
      thumbnail: pickUrl(thumbs[0]?.img_url, thumbs[0]?.url)
    }

    const videoList =
      model.video_list && typeof model.video_list === 'object'
        ? Object.values(model.video_list)
        : []

    for (const item of videoList) {
      const url = pickUrl(
        item.main_url,
        item.play_addr?.url_list,
        item.url_list,
        item.url
      )

      const backupUrl = pickUrl(
        item.backup_url,
        item.backup_url_1,
        item.backup_url_2
      )

      if (!url && !backupUrl) continue

      result.downloads.push({
        quality: item.definition || item.quality || item.vtype || 'unknown',
        size: item.size || item.file_size || 0,
        fps: item.fps || null,
        bitrate: item.bitrate || null,
        codec: item.codec_type || item.codec || null,
        url: url || backupUrl,
        backup_url: backupUrl
      })
    }

    // PRIORITAS: Utamakan codec H.264 karena H.265 (bytevc1) sering menyebabkan video blank di browser
    result.downloads.sort((a, b) => {
        const aIsH264 = String(a.codec).toLowerCase().includes('h264');
        const bIsH264 = String(b.codec).toLowerCase().includes('h264');
        
        if (aIsH264 && !bIsH264) return -1;
        if (!aIsH264 && bIsH264) return 1;
        
        return (b.size || 0) - (a.size || 0);
    });

    result.url = result.downloads[0]?.url || result.url || null
    result.backup_url = result.downloads[0]?.backup_url || result.backup_url || null
    result.status = Boolean(result.url || result.downloads.length)

    if (!result.status) result.error = 'Video URL not found'

    return result
  }
}

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
