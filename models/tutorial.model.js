module.exports = (sequelize, Sequelize) => {
  const Tutorial = sequelize.define("tutorial", {
    GR_NO: {
      type: Sequelize.STRING
    },
    PRN_NO: {
      type: Sequelize.STRING
    },
    Candidate_Name: {
      type: Sequelize.STRING
    },
    Religion: {
      type: Sequelize.STRING
    },
    Caste: {
      type: Sequelize.STRING
    },
    sub_caste: {
      type: Sequelize.STRING
    },
    Birth_Place: {
      type: Sequelize.STRING
    },
    DOB: {
      type: Sequelize.STRING
    },
    Last_College_Name: {
      type: Sequelize.STRING
    },
    Date_of_admission: {
      type: Sequelize.STRING
    }
  });

  return Tutorial;
};