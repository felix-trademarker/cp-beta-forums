let rpoContentsMerged = require('../repositories/mysql/contentMerged');
let rpoLessonsourcesLocal = require('../repositories/lessonSourcesLocal');
let rpoDailyMotion = require('../repositories/videosDailyMotion')

let rpoLessonProgressAws = require('../repositories/awsLessonProgress')
let rpoLessonProgress = require('../repositories/lessonProgress')

let rpoUsersSQL = require('../repositories/mysql/_users')

let moment = require('moment');
const { getCharacterInFrequencyListByPosition } = require('hanzi');

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

    item.dialogues = await this.getLessonDialogue(content.v3_id)
    item.vocabularies = await this.getLessonVocabulary(content,content.v3_id)
    item.expansions = await this.getLessonExpansion(content.v3_id)
    
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

exports.getLessonDialogue = async function(v3Id){
    
    let rawDialogues = await rpoContentsMerged.getRawDialogues(v3Id)

    let dialogueData = []

    rawDialogues.forEach((dialogue) => {

        dialogue.vocabulary = []
        dialogue.sentence = []
        dialogue.english = dialogue.row_2
        dialogue.pinyin = ''
        dialogue.simplified = ''
        dialogue.traditional = ''
        dialogue['row_1'].replace(
        /\(event,\'(.*?)\',\'(.*?)\',\'(.*?)\',\'(.*?)\'.*?\>(.*?)\<\/span\>([^\<]+)?/g,
        function (A, B, C, D, E, F, G, H) {
            let d = ''
            let e = ''
            let c = ''
            let b = ''
            let g = ''

            try {
            d = decodeURI(D)
            } catch (err) {
            d = D
            }
            try {
            e = decodeURI(E)
            } catch (err) {
            e = E
            }
            try {
            c = decodeURI(C)
            } catch (err) {
            c = C
            }
            try {
            b = decodeURI(B)
            } catch (err) {
            b = B
            }

            dialogue.sentence.push({
            simplified: d,
            traditional: e,
            pinyin: c,
            english: b,
            })

            dialogue.pinyin += c + ' '
            dialogue.simplified += d
            dialogue.traditional += e

            if (G) {
            try {
                g = decodeURI(G)
            } catch (err) {
                g = G
            }
            dialogue.sentence.push(g)
            dialogue.pinyin += g
            dialogue.simplified += g
            dialogue.traditional += g
            }

            dialogue.vocabulary.push({
            simplified: d ? d : '',
            traditional: e ? e : '',
            pinyin: c ? c : '',
            english: b ? b : '',
            })
        }
        )
        dialogueData.push(
        {
            displayOrder: dialogue.display_order,
            speaker: dialogue.speaker,
            audio: dialogue.audio,
            english: dialogue.english,
            simplified: dialogue.simplified,
            traditional: dialogue.traditional,
            pinyin: dialogue.pinyin,
            sentence: dialogue.sentence,
            vocabulary: dialogue.vocabulary,
        }
        )
    })

    return dialogueData

}

exports.getLessonVocabulary = async function(content,v3Id){
    let vocab = await rpoContentsMerged.getRawVocab(v3Id)


    let returnData = []

    for (let i=0; i < vocab.length; i++) {
        returnData.push({
            simplified: vocab[i].column_1,
            pinyin: vocab[i].column_2,
            english: vocab[i].column_3,
            traditional: vocab[i].column_4,
            audio: this.getFileLink(content, vocab[i].audio),
            class: vocab[i].vocabulary_class,
        })
    }



    return returnData
}

exports.getLessonExpansion = async function(v3Id){

    const groupBy = (key) => (array) =>
      array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key]
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj)
        return objectsByKeyValue
      }, {})
    const groupByVocab = groupBy('vocabulary')


    let rawExpansions = await rpoContentsMerged.getRawExpansion(v3Id)


    rawExpansions.forEach((expansion) => {
        expansion.sentence = []
        expansion['target'] = expansion['row_2']
        expansion['en'] = expansion['row_2']
        expansion.p = ''
        expansion.s = ''
        expansion.t = ''
        expansion['row_1'].replace(
          /\(event,\'(.*?)\',\'(.*?)\',\'(.*?)\',\'(.*?)\'.*?\>(.*?)\<\/span\>([^\<]+)?/g,
          function (A, B, C, D, E, F, G, H) {
            let d = ''
            let e = ''
            let c = ''
            let b = ''
            let g = ''
  
            try {
              d = decodeURI(D)
            } catch (err) {
              d = D
            }
            try {
              e = decodeURI(E)
            } catch (err) {
              e = E
            }
            try {
              c = decodeURI(C)
            } catch (err) {
              c = C
            }
            try {
              b = decodeURI(B)
            } catch (err) {
              b = B
            }
  
            expansion.sentence.push({
              s: d,
              t: e,
              p: c,
              en: b,
            })
  
            expansion.p += c + ' '
            expansion.s += d
            expansion.t += e
  
            if (G) {
              try {
                g = decodeURI(G)
              } catch (err) {
                g = G
              }
              expansion.sentence.push(g)
              expansion.p += g
              expansion.s += g
              expansion.t += g
            }
          }
        )
  
        delete expansion['row_1']
        delete expansion['row_2']
      })
      let groupedData = groupByVocab(rawExpansions)
      let returnData = []
      Object.keys(groupedData).forEach((expansion) => {
        returnData.push({
          phrase: expansion,
          examples: groupedData[expansion],
        })
      })
      return returnData
}

// exports.testGetUserProgress = async function() {
    
//     let userProgress = await rpoLessonProgressAws.get()
//     console.log('** Found >> ',userProgress.length);
//     for (let i=0; i < userProgress.length; i++){
//         let userProg = userProgress[i]
//         delete userProg._id

//         rpoLessonProgress.put(userProg)
//         console.log('** insert >> ',i);
//     }
//     console.log("==== FOR LOOP END ====");
// }

exports.getUserProgress = async function(req) {
    
    let hours = '2'
    let days = 'hours'

    if (req.params.h) {
        hours = req.params.h
    }

    if (req.params.d) {
        days = req.params.d
    }

    let userProgress = await rpoLessonProgressAws.findQuery({updated_at: {$gte : new Date(moment().subtract(hours,days).format())}})
    // console.log(moment().subtract('2','days').format());
    let returnedData = []
    
    if (userProgress && userProgress.length > 0) {
        for (let i=0; i < userProgress.length; i++) {
            let progress = userProgress[i]
            let user = await rpoUsersSQL.getUserByIdSQL(progress.userId)
            user = user && user.length > 0 ? user[0] : null

            progress.user = {
                email: user.email,
                name: user.name,
                username: user.username,
            }

            returnedData.push(progress)
        }
    }

    return returnedData
}