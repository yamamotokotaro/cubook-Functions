import * as functions from "firebase-functions"
import * as admin from "firebase-admin";
const async = require("async")
const fireStore = admin.firestore();
const { Storage } = require("@google-cloud/storage");
const storage = new Storage();
const bucket = storage.bucket("cubook-3c960.appspot.com")
const cors = require("cors")({ origin: true });


const runtimeOpts = {
    timeoutSeconds: 540,
    memory: "1GB" as const
}

bucket.renameFolder = function (source: any, dest: any, callback: (arg0: any) => any) {
    bucket.getFiles({ prefix: source }, function (err: any, files: any) {
        if (err) return callback(err)

        async.eachLimit(files, 5, function (file: { move: (arg0: any, arg1: any) => void; name: string; }, next: any) {
            file.move(file.name.replace(source, dest), next)
        }, callback)
    })
}

export default functions.runWith(runtimeOpts).region("asia-northeast1").https.onRequest((request, response) => {
    cors(request, response, () => {
        let res;
        const batch = fireStore.batch();
        let count_category = 0;

        const idToken = request.body.idToken;
        const documentID = request.body.documentID;


        admin.auth().verifyIdToken(idToken)
            .then(function (decodedToken) {
                const isAdmin = decodedToken.admin;
                const uid_operator = decodedToken.uid;
                // let progress = 0.0;

                if (isAdmin) {
                    const migrationRef = fireStore.collection("migration").doc(documentID);
                    migrationRef.get()
                        .then(migrationSnapshot => {
                            migrationRef.update({ "phase": "migrating" }).then().catch();
                            const uid = migrationSnapshot.get("uid");
                            const group = migrationSnapshot.get("group");
                            const group_from = migrationSnapshot.get("group_from");
                            const name_user = migrationSnapshot.get("name");
                            const userRef = fireStore.collection("user").where("group", "==", group).where("uid", "==", uid_operator);
                            userRef.get().then(query_user => {
                                const userSnapshot = query_user.docs[0];
                                const groupName = userSnapshot.get("groupName");
                                // migrationRef.update({"phase": "migrating", "progress": progress}).then().catch();
                                const listCollection = ["risu", "usagi", "sika", "kuma", "tukinowa", "challenge", "syokyu", "nikyu", "ikkyu", "kiku", "hayabusa", "fuji", "gino", "user", "activity_personal"];
                                for (const category of listCollection) {
                                    const collectionRef = fireStore.collection(category).where("group", "==", group_from).where("uid", "==", uid);
                                    collectionRef.get()
                                        .then(query => {
                                            let count = 0;
                                            const docs = query.docs;
                                            for (const collectionSnapshot of docs) {
                                                const map = collectionSnapshot.data();
                                                map["group"] = migrationSnapshot.get("group");
                                                if (category !== "user" && category !== "activity_personal") {
                                                    const dataSigned = collectionSnapshot.get("signed");
                                                    for (const key in dataSigned) {
                                                        const map_data = dataSigned[key]["data"];
                                                        if (map_data !== undefined) {
                                                            for (const key_map in map_data) {
                                                                const detail_data = map_data[key_map];
                                                                const type_data = detail_data["type"];
                                                                if (type_data === "image" || type_data === "video") {
                                                                    const location_data = detail_data["body"].split("/");
                                                                    detail_data["body"] = group + "/" + location_data[1] + "/" + location_data[2];
                                                                }
                                                                map_data[key_map] = detail_data;
                                                            }
                                                            dataSigned[key]["data"] = map_data;
                                                        }
                                                    }
                                                    map["signed"] = dataSigned;
                                                    batch.update(fireStore.collection(category).doc(collectionSnapshot.id), map);
                                                } else if (category === "user") {
                                                    map["groupName"] = groupName;
                                                    admin.auth().setCustomUserClaims(uid, {
                                                        name: collectionSnapshot.get("name"),
                                                        group: group,
                                                        family: collectionSnapshot.get("family"),
                                                        first: collectionSnapshot.get("first"),
                                                        call: collectionSnapshot.get("call"),
                                                        age: collectionSnapshot.get("age"),
                                                        position: collectionSnapshot.get("position"),
                                                        grade: collectionSnapshot.get("grade"),
                                                        groupName: map["groupName"],
                                                    }).then().catch();
                                                    batch.update(fireStore.collection(category).doc(collectionSnapshot.id), map);
                                                } else if (category === "activity_personal") {
                                                    map["type"] = "migration";
                                                    batch.set(fireStore.collection(category).doc(), map);
                                                }
                                                count += 1;
                                            }

                                            if (count > 0) {
                                                count_category += 1;
                                                // batch = fireStore.batch();
                                                count = 0;
                                                console.log(category + " is done");
                                            } else {
                                                count_category += 1;
                                                console.log(category + " is empty");
                                            }
                                            if (listCollection.length === count_category) {
                                                batch.update(migrationRef, { "phase": "finished" });
                                                batch.commit().then(function () {
                                                    console.log("document complete")
                                                    try {
                                                        admin.auth().getUser(uid)
                                                            .then(function (userRecord) {
                                                                const address = userRecord.email;
                                                                console.log(address);
                                                                const citiesRef = fireStore.collection("mail");
                                                                const text = name_user + "様\n\nあなたのアカウントはcubookのグループ「" + groupName + "」へ移行されました\n\nこの操作に心当たりがない場合は直ちに所属隊の指導者等にお問い合わせください\n\ncubook";
                                                                citiesRef.doc().set({
                                                                    to: address,
                                                                    message: {
                                                                        subject: "cubookアカウントが「" + groupName + "」へ移行されました",
                                                                        text: text
                                                                    }
                                                                }).then(function () {
                                                                    res = "success";
                                                                }).catch();
                                                            }).catch();
                                                    } catch (e) {
                                                        console.log(`エラー発生 ${e}`);
                                                        console.log(uid);
                                                    }
                                                    bucket.renameFolder(migrationSnapshot.get("group_from") + "/" + uid, migrationSnapshot.get("group") + "/" + uid, console.log);
                                                }).catch();
                                            }
                                        }).catch();
                                }
                                res = "sucess";
                                response.send(res);
                            }).catch();
                        }).catch();
                } else {
                    res = "you are not admin";
                    response.send(res);
                }
            }).catch(function (error) {
                // Handle error
                res = "not found";
                response.send(res);
            });
    });
});