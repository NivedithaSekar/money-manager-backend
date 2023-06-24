import express from "express";
import {
  createEntity,
  deleteEntity,
  findAllWithQuery,
  getChartData,
  readAll,
  readOneEntity,
  updateEntity,
} from "../../database/db-utilities.js";
import { checkTokenHeader } from "../../middleware/auth-check.js";
import jwt from "jsonwebtoken";

const entryRouter = express.Router();

entryRouter.get("/get", checkTokenHeader, async (req, res) => {
  // Get Query params
  const { userID: userId } = req.query;
  //console.log(userId);
  if (userId) {
    res.send(await findAllWithQuery("entries", { userId }));
  }
});

entryRouter.post("/getChartData", checkTokenHeader, async (req, res) => {
  const { userID: userId } = req.query;
  const { body: filterObj } = req;

  if (userId) {
    res.send(await getChartData("entries", userId, filterObj.filter));
  }
});

entryRouter.put("/get", checkTokenHeader, async (req, res) => {
  const { userID: userId } = req.query;
  const { body: filterObj } = req;
  //console.log(filterObj);
  function DeleteKeys(myObj, array = ["from_date", "to_date"]) {
    for (let index = 0; index < array.length; index++) {
      delete myObj[array[index]];
    }
    return myObj;
  }
  let queryObj = DeleteKeys({ ...filterObj, userId: userId });
  filterObj.to_date = filterObj.to_date
    ? filterObj.to_date.replace(/(\d\d)\-(\d\d)\-(\d{4})/, "$3-$1-$2")
    : undefined;
  filterObj.from_date = filterObj.from_date
    ? filterObj.from_date.replace(/(\d\d)\-(\d\d)\-(\d{4})/, "$3-$1-$2")
    : undefined;
  //console.log(filterObj.to_date)
  if (filterObj.to_date && filterObj.from_date) {
    queryObj = {
      ...queryObj,
      occuredAt: {
        $gte: new Date(filterObj.from_date),
        $lte: new Date(filterObj.to_date),
      },
    };
  } else if (filterObj.from_date) {
    queryObj = {
      ...queryObj,
      occuredAt: { $gte: `ISODate(${filterObj.from_date})` },
    };
  } else if (filterObj.to_date) {
    queryObj = {
      ...queryObj,
      occuredAt: { $lte: `ISODate(${filterObj.to_date})` },
    };
  }
  res.send(await findAllWithQuery("entries", queryObj));
});

entryRouter.get("/:entryId", checkTokenHeader, async (req, res) => {
  const { entryId } = req.params;
  res.send(await readOneEntity("entries", entryId));
});

// Create a Entry for the Auth User
entryRouter.post("/new", checkTokenHeader, async (req, res) => {
  const { body: entryObj } = req;
  jwt.verify(
    req.headers["accesstoken"],
    process.env.JWT_KEY,
    async function (err, decoded) {
      if (err) {
        res.send({ msg: "Session Expired! Please Login!" });
      }
      // prepare the product obj to be stored in db
      await createEntity("entries", {
        ...entryObj,
        amount: +entryObj.amount,
        userId: decoded.id,
      });
      res.send({ msg: "Entry Created Successfully" });
    }
  );
});

entryRouter.put("/edit/:entryId", checkTokenHeader, async (req, res) => {
  const { entryId } = req.params;
  const { body: entryObj } = req;
  await updateEntity("entries", entryId, entryObj);
  res.send({ msg: "Entry updated Successfully" });
});

entryRouter.delete("/:entryId", checkTokenHeader, async (req, res) => {
  const { entryId } = req.params;
  await deleteEntity("entries", entryId);
  res.send({ msg: "Entry deleted Successfully" });
});

export default entryRouter;
