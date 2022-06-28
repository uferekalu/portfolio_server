let path = require("path");
let express = require("express");
let mongoose = require("mongoose");
let router = express.Router();
let multer = require("multer");
let { v4: uuidv4 } = require("uuid");
let Service = require("../../models/Service");
const DIR = "./public";

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, DIR);
  },
  filename: (req, file, callback) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    callback(null, uuidv4() + "-" + fileName);
  }
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      callback(null, true);
    } else {
      callback(null, false);
      return callback(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  }
});

//get all services
router.get("/services", async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    return res.status(200).json(services);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

// get one service
router.get("/services/:id", async (req, res) => {
  try {
    const _id = req.params.id;

    const service = await Service.findOne({ _id });
    if (!service) {
      return res
        .status(404)
        .json({ message: `Service with id ${_id} is not found` });
    } else {
      return res.status(200).json(service);
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

// create one service
router.post(
  "/services",
  upload.single("serviceImage"),
  async (req, res, next) => {
    console.log(req.file, req.body);
    const url = req.protocol + "://" + req.get("host");
    const serviceName = req.body.serviceName;
    const serviceDescription = req.body.serviceDescription;

    const existingService = await Service.findOne({ serviceName });
    if (existingService) {
      return res.status(400).json({
        message: `Service with the name "${serviceName}" has already been created`
      });
    }

    const service = new Service({
      serviceName: serviceName,
      serviceDescription: serviceDescription,
      serviceImage: url + "/public/" + req.file.filename
    });

   service
      .save()
      .then(result => {
        res.status(201).json({
          message: "Service created successfully",
          serviceCreated: {
            _id: result._id,
            serviceName: result.serviceName,
            serviceDescription: result.serviceDescription,
            serviceImage: result.serviceImage
          }
        });
      })
      .catch(error => {
        throw (
          new Error(error),
          console.log(error),
          res.status(500).json({
            error: error
          })
        );
      });
  }
);

//update one service
router.patch(
  "/services/:id",
  upload.single("serviceImage"),
  async (req, res, next) => {
    console.log(req.file, req.body);
    try {
      const url = req.protocol + "://" + req.get("host");
      const serviceName = req.body.serviceName;
      const serviceDescription = req.body.serviceDescription;
      const options = { new: true };

      const _id = req.params.id;
      let service = await Service.findOne({ _id });

      var updatedData = {
        serviceName: serviceName,
        serviceDescription: serviceDescription,
        serviceImage: url + "/public/" + req.file.filename
      };

      const result = await Service.findByIdAndUpdate(_id, updatedData, options);

      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }

    // let service = Service.findOne({ _id });

    // if (!service) {
    //   service = new Service({
    //     _id: new mongoose.Types.ObjectId(),
    //     serviceName: serviceName,
    //     serviceDescription: serviceDescription,
    //     serviceImage: url + "/public/" + req.file.filename
    //   });

    //   service
    //     .save()
    //     .then(result => {
    //       res.status(201).json({
    //         message: "Service created successfully",
    //         serviceCreated: {
    //           _id: result._id,
    //           serviceName: result.serviceName,
    //           serviceDescription: result.serviceDescription,
    //           serviceImage: result.serviceImage
    //         }
    //       });
    //     })
    //     .catch(error => {
    //       console.log(error), res.status(500).json({
    //         error: error
    //       });
    //     });
    // } else {
    //   service.serviceName = serviceName;
    //   service.serviceDescription = serviceDescription;
    //   service.serviceImage = url + "/public/" + req.file.filename;

    //   service
    //     .save()
    //     .then(result => {
    //       res.status(200).json({
    //         message: "Service updated successfully",
    //         serviceCreated: {
    //           _id: result._id,
    //           serviceName: result.serviceName,
    //           serviceDescription: result.serviceDescription,
    //           serviceImage: result.serviceImage
    //         }
    //       });
    //     })
    //     .catch(error => {
    //       console.log(error), res.status(500).json({
    //         error: error
    //       });
    //     });
    // }
  }
);

// delete one service
router.delete("/services/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const service = await Service.deleteOne({ _id });

    if (service.deletedCount === 0) {
      return res.status(400).json({ status: "failed" });
    } else {
      return res.status(204).json({ status: "success" });
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

module.exports = router;
