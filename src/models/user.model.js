class UserModel {
  constructor() {
    this.userStates = new Map();
    this.userGenerations = new Map();
  }

  initializeUser(chatId) {
    if (!this.userGenerations.has(chatId)) {
      this.userGenerations.set(chatId, {
        freeGenerations: 5,
        referredBy: null,
      });
    }
    return this.userGenerations.get(chatId);
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

  addReferralBonus(referrerId) {
    const referrerData = this.userGenerations.get(referrerId);
    if (referrerData) {
      referrerData.freeGenerations += 1;
      this.userGenerations.set(referrerId, referrerData);
      return true;
    }
    return false;
  }

  useGeneration(chatId) {
    const userData = this.userGenerations.get(chatId);
    if (userData && userData.freeGenerations > 0) {
      userData.freeGenerations -= 1;
      this.userGenerations.set(chatId, userData);
      return true;
    }
    return false;
  }

  getRemainingGenerations(chatId) {
    const userData = this.userGenerations.get(chatId);
    return userData ? userData.freeGenerations : 0;
  }
}

module.exports = new UserModel();
