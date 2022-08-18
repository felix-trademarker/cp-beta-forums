let rpoContents = require('../repositories/mysql/_contents');
let rpoContentsMerged = require('../repositories/mysql/contentMerged');
let rpoUsers = require('../repositories/mysql/_users');
let rpoUserOptions = require('../repositories/mysql/_user_options');
let rpoUserAddresses = require('../repositories/mysql/_user_addresses');
let rpoUserSettings = require('../repositories/mysql/_user_settings');
let rpoUserVocabulary = require('../repositories/mysql/_user_vocabulary');
let rpoUserPreferences = require('../repositories/mysql/_user_preferences');

let rpoLessonsources = require('../repositories/awsLessonSources');
let rpoLessonsourcesLocal = require('../repositories/lessonSourcesLocal');
let rpoLessonsourcesMongo = require('../repositories/lessonSources')
let rpoDailyMotion = require('../repositories/videosDailyMotion')

let rpoMigrations = require('../repositories/mysql/_migrations');
let moment = require('moment');

exports.getLesson = async function(v3Id) {

    let contents = await rpoContentsMerged.getContentV3(v3Id)
    let content = contents && contents.length > 0 ? contents[0] : [];

    // TRANSFORM IMAGE LINK
    if (content.image.includes("https")) {
        content.image = content.image
    } else {
        content.image = "https://s3contents.chinesepod.com/"+ content.v3_id + "/" + content.hash_code +"/"+ content.image
    }

    // TRANSFORM MP3 LINK
    if (content.mp3_public.includes("https")) {
        content.mp3_public = content.mp3_public
    } else {
        if (content.mp3_public)
        content.mp3_public = "https://s3contents.chinesepod.com/"+ content.v3_id + "/" + content.hash_code +"/"+ content.mp3_public
    }

    let videos = []
    videos = await this.getVideos(content) 
    console.log(videos);

    let item = {
        v3Id: content.v3_id,
        title: content.title,
        slug: content.slug,
        type: content.type,
        introduction: content.type,
        level: content.level,
        image: content.image, 
        transcription: content.transcription1, 
        transcriptionPinyin: content.transcription2, 
        audioMp3: {
            dialogue : this.getFileLink(content, content.mp3_dialogue),
            private : this.getFileLink(content, content.mp3_private),
            review : this.getFileLink(content, content.mp3_thefix),
            public : this.getFileLink(content, content.mp3_public)
        }, 
        notes: {
            simplified : this.getFileLink(content, content.pdf1),
            traditional : this.getFileLink(content, content.pdf2)
        },
        videos: videos
    }
    
    return item
}

exports.getFileLink = function(item, file) {
    if (file.includes("https")) {
        file = file
    } else {
        if (file)
        file = "https://s3contents.chinesepod.com/"+ item.v3_id + "/" + item.hash_code +"/"+ file
    }

    return file;
}

exports.getVideos = async function(item) {

    let video = {
        id: '',
        platform: '',
        length: 'full',
        languageType: ''
    }
    let videos = [], temp={};
    
    let source = await rpoLessonsourcesLocal.findQuery({v3_id:item.v3_id})

    if (source && source.length > 0) {
        for (let i=0; i < source.length; i++) {
            if (source[i].youtube && source[i].youtube.simplified) {

                temp = this.getVideoObj() 
                temp.platform = 'youtube'
                temp.id = source[i].youtube.simplified
                temp.languageType = 's'

                videos.push(temp)
            }

            if (source[i].youtube && source[i].youtube.traditional) {

                temp = this.getVideoObj()  
                temp.platform = 'youtube'
                temp.id = source[i].youtube.traditional
                temp.languageType = 't'

                videos.push(temp)
            }

            if (source[i].wistia && source[i].wistia.simplified) {

                temp = this.getVideoObj()  
                temp.platform = 'wistia'
                temp.id = source[0].wistia.simplified
                temp.languageType = 's'

                videos.push(temp)
            }

            if (source[i].wistia && source[i].wistia.traditional) {

                temp = this.getVideoObj()  
                temp.platform = 'wistia'
                temp.id = source[i].wistia.traditional
                temp.languageType = 't'

                videos.push(temp)
            }

            if (source[i].vimeo && source[i].vimeo.simplified) {

                temp = this.getVideoObj()  
                temp.platform = 'vimeo'
                temp.id = source[i].vimeo.simplified
                temp.languageType = 's'

                videos.push(temp)
            }

            if (source[i].vimeo && source[i].vimeo.traditional) {

                temp = this.getVideoObj()  
                temp.platform = 'vimeo'
                temp.id = source[i].vimeo.traditional
                temp.languageType = 't'

                videos.push(temp)
            }

            if (source[i].podcast && source[i].podcast.simplified) {

                temp = this.getVideoObj()  
                temp.platform = 'podcast'
                temp.id = source[i].podcast.simplified
                temp.languageType = 's'

                videos.push(temp)
            }

            if (source[i].podcast && source[i].podcast.traditional) {

                temp = this.getVideoObj()  
                temp.platform = 'podcast'
                temp.id = source[i].podcast.traditional
                temp.languageType = 't'

                videos.push(temp)
            }

            if (source[i].dialogue && source[i].dialogue.simplified) {

                temp = this.getVideoObj()  
                temp.platform = 'dialogue'
                temp.id = source[i].dialogue.simplified
                temp.languageType = 's'

                videos.push(temp)
            }

            if (source[i].dialogue && source[i].dialogue.traditional) {

                temp = this.getVideoObj()  
                temp.platform = 'dialogue'
                temp.id = source[i].dialogue.traditional
                temp.languageType = 't'

                videos.push(temp)
            }

            if (source[i].review && source[i].review.simplified) {

                temp = this.getVideoObj()  
                temp.platform = 'review'
                temp.id = source[i].review.simplified
                temp.languageType = 's'

                videos.push(temp)
            }

            if (source[i].review && source[i].review.traditional) {

                temp = this.getVideoObj()  
                temp.platform = 'review'
                temp.id = source[i].review.traditional
                temp.languageType = 't'

                videos.push(temp)
            }

            if (source[i].recap && source[i].recap.simplified) {

                temp = this.getVideoObj()  
                temp.platform = 'recap'
                temp.id = source[i].recap.simplified
                temp.languageType = 's'

                videos.push(temp)
            }

            if (source[i].recap && source[i].recap.traditional) {

                temp = this.getVideoObj()  
                temp.platform = 'recap'
                temp.id = source[i].recap.traditional
                temp.languageType = 't'

                videos.push(temp)
            }

        } // for
    }

    let dailyMotions = await rpoDailyMotion.findQuery({v3_id:item.v3_id})
    if (dailyMotions && dailyMotions.length > 0) {

        temp = this.getVideoObj()  

        temp.platform = 'dailymotion'
        temp.id = dailyMotions[0].id
        temp.languageType = 's'

        videos.push(temp)
    }

    return videos;
}

exports.getVideoObj = function() {
    return {
        id: '',
        platform: '',
        length: 'full',
        languageType: ''
    }
}