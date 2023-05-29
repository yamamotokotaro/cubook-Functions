import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const fireStore = admin.firestore();

const usagi_title: Array<string> = [
  "笑顔",
  "運動",
  "安全",
  "清潔",
  "計測",
  "なわ結び",
  "工作",
  "表現",
  "観察",
  "野外活動",
  "役に立つ",
  "日本の国旗",
  "世界の国々",
];
const sika_title: Array<string> = [
  "感謝",
  "運動",
  "事故の予防",
  "健康",
  "計測",
  "なわ結び",
  "工作",
  "表現",
  "観察",
  "野外活動",
  "暮らしのマナー",
  "役に立つ",
  "日本の国旗",
  "世界の国々",
];
const kuma_title: Array<string> = [
  "心がけ",
  "成長",
  "事故への対応",
  "救急",
  "計測",
  "なわ結び",
  "工作",
  "表現",
  "観察",
  "野外活動",
  "暮らしのマナー",
  "役に立つ",
  "日本の国旗",
  "世界の国々",
];
const tukinowa_title: Array<string> = [
  "基本",
  "健康と発達",
  "スカウト技能",
  "善行",
  "信仰奨励",
  "班長会議",
];
const challenge_title: Array<string> = [
  "国際",
  "市民",
  "友情",
  "動物愛護",
  "案内",
  "自然保護",
  "手伝い",
  "災害救助員",
  "天文学者",
  "自然観察館",
  "ハイカー",
  "キャンパー",
  "地質学者",
  "気象学者",
  "探検家",
  "写真博士",
  "コンピュータ博士",
  "自転車博士",
  "工作博士",
  "通信博士",
  "修理博士",
  "乗り物博士",
  "技術博士",
  "救急博士",
  "特技博士",
  "水泳博士",
  "運動選手",
  "チームスポーツ博士",
  "スキー選手",
  "アイススケート選手",
  "収集家",
  "画家",
  "音楽家",
  "料理家",
  "フィッシャーマン",
  "旅行家",
  "園芸家",
  "演劇家",
  "読書家",
  "マジシャン",
];

const runtimeOpts = {
  timeoutSeconds: 540,
  memory: "1GB" as const,
};
export default functions
  .runWith(runtimeOpts)
  .region("asia-northeast1")
  .https.onRequest(async (request, response) => {
    const searchRef = fireStore.collection("task").orderBy("date");
    const searchDocs = (await searchRef.get()).docs;
    const taskLocationedDatas = [];
    let batch = fireStore.batch();
    const batchCounter = 0;
    for (const searchDoc of searchDocs) {
      const group = searchDoc.get("group");
      const type = searchDoc.get("type");
      const page = searchDoc.get("page");
      let bookName = "";
      let itemName = "";
      const searchGroupRef = fireStore.collection("group").doc(group);
      const searchGroupDoc = await searchGroupRef.get();
      const groupLocation = searchGroupDoc.get("location");
      const date = searchDoc.get("date");
      if (groupLocation !== undefined) {
        const groupName = searchGroupDoc.get("name");
        let texts = "";
        for (const data of searchDoc.get("data")) {
          if (data["type"] === "text") {
            texts += data["body"] + "\n";
          }
        }
        if (type === "usagi") {
          bookName = "うさぎのカブブック";
          itemName = usagi_title[page];
        } else if (type === "sika") {
          bookName = "しかのカブブック";
          itemName = sika_title[page];
        } else if (type === "kuma") {
          bookName = "くまのカブブック";
          itemName = kuma_title[page];
        } else if (type === "tukinowa") {
          bookName = "月の輪";
          itemName = tukinowa_title[page];
        } else if (type === "challenge") {
          bookName = "チャレンジ章";
          itemName = challenge_title[page];
        }
        if (
          bookName !== undefined &&
          itemName !== undefined &&
          date !== undefined
        ) {
          const taskLocationedData = {
            group: group,
            groupLocation: groupLocation,
            groupName: groupName,
            dateTime: date,
            year: date.toDate().getYear(),
            month: date.toDate().getMonth(),
            date: date.toDate().getDate(),
            day: date.toDate().getDay(),
            texts: texts,
            number: searchDoc.get("number"),
            page: page,
            type: type,
            bookName: bookName,
            itemName: itemName,
            uid: searchDoc.get("uid"),
            taskId: searchDoc.id,
          };
          taskLocationedDatas.push(taskLocationedData);
        }
      }

      if (batchCounter % 490 === 0) {
        batch.commit().then().catch();
        batch = fireStore.batch();
      }
    }
    await batch.commit();
    // #2 Converting the object to JSON...
    const json = JSON.stringify(taskLocationedDatas);
    response.send(json);
    console.log(batchCounter);
  });
