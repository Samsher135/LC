const db = require("../../models");
const Tutorial = db.tutorials;

const readXlsxFile = require("read-excel-file/node");
const excel = require("exceljs");

const upload = async (req, res) => {
  try {
    if (req.file == undefined) {
      return res.status(400).send("Please upload an excel file!");
    }

    let path =
      __basedir + "/resources/static/assets/uploads/" + req.file.filename;

    readXlsxFile(path).then((rows) => {
      // skip header
      rows.shift();

      let tutorials = [];

      rows.forEach((row) => {
        let tutorial = {
          GR_NO: row[0],
          PRN_NO: row[1],
          Candidate_Name: row[2],
          Religion: row[3],
          Caste: row[4],
          sub_caste: row[5],
          Birth_Place: row[6],
          DOB: row[7],
          Last_College_Name: row[8],
          Date_of_admission: row[9],
        };

        tutorials.push(tutorial);
      });

      Tutorial.bulkCreate(tutorials)
        .then(() => {
          res.status(200).send({
            message: "Uploaded the file successfully: " + req.file.originalname,
          });
        })
        .catch((error) => {
          res.status(500).send({
            message: "Fail to import data into database!",
            error: error.message,
          });
        });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Could not upload the file: " + req.file.originalname,
    });
  }
};

const getTutorials = (req, res) => {
  Tutorial.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

const download = (req, res) => {
  Tutorial.findAll().then((objs) => {
    let tutorials = [];

    objs.forEach((obj) => {
      tutorials.push({
        GR_NO: obj.GR_NO,
        PRN_NO: obj.PRN_NO,
        Candidate_Name: obj.Candidate_Name,
        Religion: obj.Religion,
        Caste: obj.Caste,
        sub_caste: obj.sub_caste,
        Birth_Place: obj.Birth_Place,
        DOB: obj.DOB,
        Last_College_Name: obj.Last_College_Name,
        Date_of_admission: obj.Date_of_admission,
      });
    });

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Tutorials");

    worksheet.columns = [
      { header: "GR_NO", key: "GR_NO", width: 25 },
      { header: "PRN_NO", key: "PRN_NO", width: 25 },
      { header: "Candidate_Name", key: "Candidate_Name", width: 25 },
      { header: "Religion", key: "Religion", width: 25 },
      { header: "Caste", key: "Caste", width: 25 },
      { header: "sub_caste", key: "sub_caste", width: 25 },
      { header: "Birth_Place", key: "Birth_Place", width: 25 },
      { header: "DOB", key: "DOB", width: 25 },
      { header: "Last_College_Name", key: "Last_College_Name", width: 25 },
      { header: "Date_of_admission", key: "Date_of_admission", width: 25 },
    ];

    // Add Array Rows
    worksheet.addRows(tutorials);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "tutorials.xlsx"
    );

    return workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });
  });
};

module.exports = {
  upload,
  getTutorials,
  download,
};
