import * as admin from "firebase-admin";
admin.initializeApp();

// 関数名とファイルパスのペア
const funcs: any = {
  changeAddress: "./modules/https/changeAddress",
  changeUserInfo_group: "./modules/https/changeUserInfo_group",
  checkCongrats: "./modules/https/checkCongrats",
  createGroup: "./modules/https/createGroup",
  deleteGroupAccount_https: "./modules/https/deleteGroupAccount",
  inviteGroup: "./modules/https/inviteGroup",
  joinGroup: "./modules/https/joinGroup",
  restoreCount: "./modules/https/restoreCount",
  sendMigration: "./modules/https/sendMigration",
  executeMigration: "./modules/https/executeMigration",
  rejectMigration: "./modules/https/rejectMigration",
  transferOwner: "./modules/https/transferOwner",
  addLocationInfo: "./modules/https/addLocationInfo",
  addLocationToTask: "./modules/https/addLocationToTask",
  lumpCreate: "./modules/trigger/lumpCreate",
  sendnotification: "./modules/trigger/sendnotification",
  changeGroupUserInfo: "./modules/call/changeGroupUserInfo",
  createGroupCall: "./modules/call/createGroup",
  deleteGroupAccount: "./modules/call/deleteGroupAccount",
  executeMigrationCall: "./modules/call/executeMigration",
  inviteGroupCall: "./modules/call/inviteGroup",
  joinGroupCall: "./modules/call/joinGroup",
  rejectMigrationCall: "./modules/call/rejectMigration",
  sendMigrationCall: "./modules/call/sendMigration",

};

// funcsで定義した内容をexportsに追加する
for (const name in funcs) {
  // 環境変数の関数名を見て、funcsの関数名と同じなら、呼び出す判定を追加
  if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === name) {
    // "exports.onCreateUser = require("./modules/onCreateUser").default;"と一緒
    exports[name] = require(funcs[name]).default;
  }
}
