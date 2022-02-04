const db = require("../../models");
const Tutorial = db.tutorials;
const printed = db.printed_lc;

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
  printed.findAll()
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
  printed.findAll().then((objs) => {
    let printed_lcs = [];

    objs.forEach((obj) => {
      printed_lcs.push({
        serial_no: obj.serial_no,
        GR_NO: obj.GR_NO,
        Candidate_Name: obj.Candidate_Name,
        year: obj.year,
        course: obj.course,
        Date_of_issue: obj.Date_of_issue,
        too: obj.too,
        remark: obj.remark
      });
    });

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("printeds");

    worksheet.columns = [
      { header: "serial_no", key: "serial_no", width: 25 },
      { header: "GR_NO", key: "GR_NO", width: 25 },
      { header: "Candidate_Name", key: "Candidate_Name", width: 25 },
      { header: "year", key: "year", width: 25 },
      { header: "course", key: "course", width: 25 },
      { header: "Date_of_issue", key: "Date_of_issue", width: 25 },
      { header: "too", key: "too", width: 25 },
      { header: "remark", key: "remark", width: 25 },
    ];

    // Add Array Rows
    worksheet.addRows(printed_lcs);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "printed_lcs.xlsx"
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
