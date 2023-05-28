import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
var request = require('request');
const storage = admin.storage();

export default functions.region('asia-northeast1').firestore.document('task/{task}').onUpdate(async(data, context) => {
    
    const documentSnapshot = data.after;
    const family = documentSnapshot.get('family');
    const first = documentSnapshot.get('first');
    const call = documentSnapshot.get('call');
    const phase = documentSnapshot.get('phase');
    const type = documentSnapshot.get('type');
    const page = documentSnapshot.get('page');
    const number = documentSnapshot.get('number');
    const taskDatas = documentSnapshot.get('data');
    if(phase === 'signed'){
        const challenge_number : Array<string> = [
            '1-1','1-2','1-3','1-4','1-5','1-6','1-7','1-8','2-1','2-2','2-3','2-4','2-5','2-6','2-7','3-1','3-2','3-3','3-4','3-5','3-6','3-7','3-8','3-9','3-10','4-1','4-2','4-3','4-4','4-5','5-1','5-2','5-3','5-4','5-5','5-6','5-7','5-8','5-9','5-10'
        ];
        const usagi_title : Array<string> = [
            '笑顔','運動','安全','清潔','計測','なわ結び','工作','表現','観察','野外活動','役に立つ','日本の国旗','世界の国々'
        ];
        const sika_title : Array<string> = [
            '感謝','運動','事故の予防','健康','計測','なわ結び','工作','表現','観察','野外活動','暮らしのマナー','役に立つ','日本の国旗','世界の国々'
        ];
        const kuma_title : Array<string> = [
            '心がけ','成長','事故への対応','救急','計測','なわ結び','工作','表現','観察','野外活動','暮らしのマナー','役に立つ','日本の国旗','世界の国々'
        ];
        const tukinowa_title : Array<string> = [
            '基本', '健康と発達', 'スカウト技能', '善行', '信仰奨励', '班長会議',
        ];
        const challenge_title : Array<string> = [
            '国際','市民','友情','動物愛護','案内','自然保護','手伝い','災害救助員','天文学者','自然観察館','ハイカー','キャンパー','地質学者','気象学者','探検家','写真博士','コンピュータ博士','自転車博士','工作博士','通信博士','修理博士','乗り物博士','技術博士','救急博士','特技博士','水泳博士','運動選手','チームスポーツ博士','スキー選手','アイススケート選手','収集家','画家','音楽家','料理家','フィッシャーマン','旅行家','園芸家','演劇家','読書家','マジシャン'
        ];
        let bookName!:string;
        let itemName!:string;
        if(type === 'usagi'){
          bookName = 'うさぎのカブブック';
          itemName = usagi_title[page];
        } else if(type === 'sika'){
          bookName = 'しかのカブブック';
          itemName = sika_title[page];
        } else if(type === 'kuma'){
          bookName = 'くまのカブブック';
          itemName = kuma_title[page];
        } else if(type === 'tukinowa'){
          bookName = '月の輪';
          itemName = tukinowa_title[page];
        } else if(type === 'challenge'){
          bookName = 'チャレンジ章';
          itemName = challenge_title[page];
        }
        let body:string;
        if(type === 'challenge'){
          body = family + first + call + 'が' + bookName + ' ' + challenge_number[page] + ' ' + itemName  + '（' + number + '）' + 'を取り組みました📖';
        } else {
          body = family + first + call + 'が' + bookName + ' ' + (page+1).toString() + ' ' + itemName  + '（' + number + '）' + 'を取り組みました📖';
        }
        const imageList = [];
        let texts = "";
        const options = {
            version: 'v2' as 'v2', // defaults to 'v2' if missing.
            action: "read" as "read",
            expires: Date.now() + 1000 * 60 * 60, // one hour
          };

        console.log('1');
        for(const taskData of taskDatas){
            if(taskData['type'] == 'image'){
                const url = await storage.bucket('cubook-3c960.appspot.com').file(taskData['body']).getSignedUrl(options);
                imageList.push(url);
            } else if(taskData['type'] == 'text'){
                texts += '¥n' + taskData['body'];
            }
        }
        console.log('2');
        const attachments = [];
        for(const image of imageList){
            attachments.push(
                {"imageUrl": image},
            )
        }
        console.log(attachments);

        const jsonData = JSON.stringify({
            text: body+texts,
            attachments: attachments
        });

        console.log(jsonData);

        const option = {
            uri: "https://hooks.slack.com/services/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",
            headers: {
                "Content-Type": "application/json",
            },
            json: jsonData
        };

        request.post(option, function(error: any, response: any, bodyResponse: any){
            console.log(bodyResponse);
        })
        console.log('5');
        request.write(jsonData);
        request.end();
    }
});