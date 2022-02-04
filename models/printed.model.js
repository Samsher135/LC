module.exports = (sequelize, Sequelize) => {
    const printed = sequelize.define("printed_lc", {
    GR_NO: {
    type: Sequelize.STRING
    },
    Candidate_Name: {
    type: Sequelize.STRING
    },
    Date_of_issue:{
    type: Sequelize.STRING
    },  
    DOL: {
    type: Sequelize.STRING
    },
    course: {
    type: Sequelize.STRING
    },
    year: {
    type: Sequelize.STRING
    },
    fromm: {
    type: Sequelize.STRING
    },
    too: {
    type: Sequelize.STRING
    },
    cgpi: {
    type: Sequelize.STRING
    },
    serial_no: {
    type: Sequelize.INTEGER
    },
    remark: {
    type: Sequelize.STRING
    }
    });
  
    return printed;
  };