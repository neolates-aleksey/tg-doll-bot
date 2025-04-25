const User = require("../models/database/user.model");

class DatabaseService {
  async getUser(chatId) {
    try {
      // Find or create user
      const [user] = await User.findOrCreate({
        where: { chatId: chatId.toString() },
        defaults: {
          freeGenerations: 3,
        },
      });
      return user;
    } catch (error) {
      console.error("Error in getUser:", error);
      throw error;
    }
  }

  async setReferrer(chatId, referrerId) {
    try {
      await User.update({ referredBy: referrerId.toString() }, { where: { chatId: chatId.toString() } });
    } catch (error) {
      console.error("Error in setReferrer:", error);
      throw error;
    }
  }

  async addReferralBonus(chatId) {
    try {
      await User.increment("freeGenerations", {
        by: 1,
        where: { chatId: chatId.toString() },
      });
    } catch (error) {
      console.error("Error in addReferralBonus:", error);
      throw error;
    }
  }

  async decrementFreeGenerations(chatId) {
    try {
      await User.increment("freeGenerations", {
        by: -1,
        where: { chatId: chatId.toString() },
      });
    } catch (error) {
      console.error("Error in decrementFreeGenerations:", error);
      throw error;
    }
  }
}

module.exports = new DatabaseService();
