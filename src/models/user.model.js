class UserModel {
  constructor() {
    this.userStates = new Map();
  }

  getUserState(chatId) {
    return this.userStates.get(chatId);
  }

  setUserState(chatId, state) {
    this.userStates.set(chatId, state);
  }

  deleteUserState(chatId) {
    this.userStates.delete(chatId);
  }
}

module.exports = new UserModel();
