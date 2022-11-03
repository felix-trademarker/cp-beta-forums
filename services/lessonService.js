let rpoContentsMerged = require('../repositories/mysql/contentMerged');
let rpoCourseContents = require('../repositories/mysql/_course_contents');
let rpoLessonsourcesLocal = require('../repositories/lessonSourcesLocal');
let rpoDailyMotion = require('../repositories/videosDailyMotion')
let rpoContent158 = require('../repositories/_contents158')
let rpoLessons158 = require('../repositories/_lessons158')
let rpoRecaps158 = require('../repositories/_recaps158')
let rpoUsers158 = require('../repositories/_users158')
let rpoDictionaries158 = require('../repositories/_dictionaries158')

let rpoUsers = require('../repositories/mysql/_users')

let rpoLessonFiles = require('../repositories/awsLessonFiles')
let rpoLessonSources = require('../repositories/lessonSources')

let rpoLessonProgressAws = require('../repositories/awsLessonProgress')
let rpoLessonProgress = require('../repositories/lessonProgress')
// let rpoAssessments = require('../repositories/awsAssessments')

let rpoUsersSQL = require('../repositories/mysql/_users')

let moment = require('moment');
const { getCharacterInFrequencyListByPosition } = require('hanzi');

const convert = require('xml-js')

exports.getLessonIds = async function(limit,offset) {
  let lessonsIds = await rpoContentsMerged.getLessonListIds(limit, offset)

  return lessonsIds
}

exports.getLesson = async function(v3Id) {

  // test
  let lessonFiles = await rpoLessonFiles.get();
  console.log(lessonFiles)

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
    // console.log(videos);

    let item = {
        v3Id: content.v3_id,
        hashCode: content.hash_code,
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
    item.comments = await this.getComments(content.v3_id)
    item.grammar = await this.getGrammar(content.v3_id)
    item.questions = await this.getQuestions(content.v3_id)

    item.recap = await rpoRecaps158.findQuery({lessonNumber:content.v3_id})

    

    // GET COURSE CONTENTS
    let courseLesson = await rpoCourseContents.getCourse(item.v3Id)

    courseLesson = courseLesson && courseLesson.length > 0 ? courseLesson[0] : null

    if (courseLesson) {
      let courseContents = await rpoCourseContents.getCourseContents(courseLesson)

      
      if (courseContents && courseContents.length ) {
        // add course contents 
        // let courseContentsArray = []
        for (let c=0; c < courseContents.length; c++) {
          courseContents[c].image = this.getFileLink(courseContents[c], courseContents[c].image)
        }

        item.courseContents = courseContents
      }
    }

    rpoLessons158.upsert({v3Id:item.v3Id},item)

    // let assessments = await rpoAssessments.get()

    // console.log(assessments);
    // for (let a=0; a < assessments.length; a++) {

    // }

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
    let hasWistia = false;

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
                hasWistia = true
            }

            if (source[i].wistia && source[i].wistia.traditional) {

                temp = this.getVideoObj()  
                temp.platform = 'wistia'
                temp.id = source[i].wistia.traditional
                temp.languageType = 't'

                videos.push(temp)
                hasWistia = true
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

    if (!hasWistia) {
      temp = this.getVideoObj()  
      temp.platform = 'wistia'
      temp.id = item.video
      temp.languageType = 's'

      videos.push(temp)
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
        expansion['english'] = expansion['row_2']
        expansion.pinyin = ''
        expansion.simplified = ''
        expansion.traditional = ''
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
              simplified: d,
              traditional: e,
              pinyin: c,
              english: b,
            })
  
            expansion.pinyin += c + ' '
            expansion.simplified += d
            expansion.traditional += e
  
            if (G) {
              try {
                g = decodeURI(G)
              } catch (err) {
                g = G
              }
              expansion.sentence.push(g)
              expansion.pinyin += g
              expansion.simplified += g
              expansion.traditional += g
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

exports.getComments = async function (v3Id) {

    let lessonComments = await rpoContentsMerged.getLessonComments(v3Id)
    let returnData = []

    for (let i=0; i < lessonComments.length; i++) {
        let comment = lessonComments[i]
        
        if (comment.replyId && comment.replyId > 0) {
            let parent = lessonComments.find((x) => x.id === comment.replyId)
            if (parent) {
              if (!parent.nestedComments) {
                parent.nestedComments = []
              }
              parent.nestedComments.push(comment)
            }
        }
    }

    return {
      count: lessonComments.length,
      comments: lessonComments
        .filter((comment) => comment.replyUserId === 0)
        .sort((a, b) => b.createdAt - a.createdAt),
    }
}

exports.getGrammar = async function(v3Id) {

    const grammarIds = await rpoContentsMerged.getGrammar(v3Id)

    let returnData = []

 

    for (let i=0; i < grammarIds.length; i++) {
        let item = grammarIds[i]
        // await asyncForEach(grammarIds, async (item) => {
        let grammarBlocks = await rpoContentsMerged.getGrammarBlock(item.grammar_id)
        // .populate('grammar')
        // .populate('examples')
        

        // console.log(grammarBlocks);
    //   grammarBlocks.forEach((block) => {
        for (let b=0; b < grammarBlocks.length; b++) {
            let block = grammarBlocks[b]
        let examples = await rpoContentsMerged.getGrammarExamples(block.id)

        block['examples'] = examples

        block['examples'].forEach((example) => {
          example.sentence = []

          // example['english'] = example['target']

          example.pinyin = ''
          example.simplified = ''
          example.traditional = ''

          example['sourceAnnotateSimplified'].replace(
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

              example.sentence.push({
                simplified: d,
                traditional: e,
                pinyin: c,
                english: b,
              })

              example.pinyin += c + ' '
              example.simplified += d
              example.traditional += e

              if (G) {
                try {
                  g = decodeURI(G)
                } catch (err) {
                  g = G
                }
                example.sentence.push(g)
                example.pinyin += g
                example.simplified += g
                example.traditional += g
              }
            }
          )
        })
        returnData.push(block)
      }
    // })
    }
    return returnData
}

exports.getQuestions = async function(v3Id) {

  // All done.
  let lessonQuestions = await rpoContentsMerged.getQuestions(v3Id)

  lessonQuestions.forEach((question) => {
    try {
      question.options = convert.xml2js(question.options, {
        compact: true,
        ignoreAttributes: true,
      })
      question.options_2 = convert.xml2js(question.options_2, {
        compact: true,
        ignoreAttributes: true,
      })
      question.options_3 = convert.xml2js(question.options_3, {
        compact: true,
        ignoreAttributes: true,
      })

      // sails.log.info(question)

      switch (question.type_id) {
        case 4:
          question.question = {
            audio: question.options.type_d.data.prototype_mp3_url['_text'],
          }
          question.answer = {
            simplified: question.options.type_d.data.prototype['_text'],
            traditional: question.options_2.type_d.data.prototype['_text'],
            pinyin: question.options_3.type_d.data.prototype['_text'],
            english: question.options.type_d.data.english['_text'],
          }
          break
        case 2:
          question.question = { segments: [] }
          question.options.type_b.data.section.forEach((segment, index) => {
            question.question.segments.push({
              simplified: segment.prototype['_text'],
              traditional:
                question.options_2.type_b.data.section[index].prototype[
                  '_text'
                ],
              pinyin:
                question.options_3.type_b.data.section[index].prototype[
                  '_text'
                ],
              english: segment.english['_text'],
              id: parseInt(segment.tag['_text']),
            })
          })
          break
        case 1:
          question.question = { segments: [] }
          question.options.type_a_options.data.section.forEach(
            (phrase, index) => {
              question.question.segments.push({
                id: parseInt(phrase.tag['_text']),
                simplified: phrase.prototype['_text'],
                traditional:
                  question.options_2.type_a_options.data.section[index]
                    .prototype['_text'],
                pinyin:
                  question.options_3.type_a_options.data.section[index]
                    .prototype['_text'],
                english: phrase.english['_text'],
              })
            }
          )
          break
        case 5:
          question.question = {
            simplified: question.title,
            traditional: question.title_2,
            pinyin: question.title_3,
            choices: [],
          }
          question.answer = {
            id: parseInt(question.options.type_e.data.answer['_text']),
            simplified: question.options.type_e.data.sentence_translation['_text'],
            traditional: question.options_2.type_e.data.sentence_translation['_text'],
            pinyin: question.options_3.type_e.data.sentence_translation['_text'],
            english: question.options.type_e.data.sentence_english['_text'],
          }

          // sails.log.info(question.options.type_e.data)

          question.options.type_e.data.options.forEach((choice, index) => {
            question.question.choices.push({
              id: parseInt(choice.tag['_text']),
              simplified: choice.prototype['_text'],
              traditional:
                question.options_2.type_e.data.options[index].prototype[
                  '_text'
                ],
              pinyin:
                question.options_3.type_e.data.options[index].prototype[
                  '_text'
                ],
              english: choice.english['_text'],
            })
          })
          break
      }
    } catch (e) {
      console.log(e);
    }
  })

  let returndata = []

  for (let q=0; q < lessonQuestions.length; q++) {
    returndata.push(
      {
        id: lessonQuestions[q].id,
        scope: lessonQuestions[q].scope,
        score: lessonQuestions[q].score,
        typeId: lessonQuestions[q].type_id,
        status: lessonQuestions[q].status,
        question: lessonQuestions[q].question,
        answer: lessonQuestions[q].answer,
        createdAt: lessonQuestions[q].createdAt
      }
    )
  }

  return {
    matching: returndata.filter((question) => {
      return question.typeId === 1
    }),
    audio: returndata.filter((question) => {
      return question.typeId === 4
    }),
    choice: returndata.filter((question) => {
      return question.typeId === 5
    }),
    rearrange: returndata.filter((question) => {
      return question.typeId === 2
    }),
  }
}


// USED IN FETCHING USER LESSON PROGRESS
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

exports.getUserData = async function(id) {
    
  let returnedData = await rpoUsers.getUserByIdSQL(id)

  returnedData = (returnedData && returnedData.length > 0 ? returnedData[0] : null)

  rpoUsers158.upsert({id:returnedData.id},returnedData)

  return returnedData
}

exports.getDictionaries = async function(limit, offset) {
    
  let returnedData = await rpoContentsMerged.getDictionaries(limit,offset)

  return returnedData
}

exports.getDictionary = async function(id) {
    
  let returnedData = await rpoContentsMerged.getDictionary(id)

  return returnedData
}

exports.searchDictionaries = async function(word) {
    
  let returnedData = await rpoContentsMerged.searchDictionaries(word)

  return returnedData
}