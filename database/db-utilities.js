//Methods defined to connect & run the DB methods(CRUD Operation acheived)

import { ObjectId } from 'mongodb';

import DbClient from './client-connectivity.js'

const DB_NAME = 'money_manager';

// GET All
// entity name
const readAll = async (entityName) => {
  return await DbClient.db(DB_NAME).collection(entityName).find(
    {},
    {
      projection: {
        _id: 0
      }
    }).toArray();
};

// GET One Entity --> READ One
const readOneEntity = async (entityName, entityId) => {
  return await DbClient.db(DB_NAME).collection(entityName).findOne(
    { 'id': entityId },
    {
      projection: {
        _id: 0
      }
    }
  );
}

// create --> CREATE
const createEntity = async (entityName, entityObj) => {
    //console.log(entityObj)
    if(entityName === 'entries'){
      return await DbClient.db(DB_NAME).collection(entityName).insertOne(
        { ...entityObj, occuredAt: new Date(entityObj.occuredAt) ,id: new ObjectId().toString(), registered_at: new Date() }
      );
    }else{
      return await DbClient.db(DB_NAME).collection(entityName).insertOne(
        { ...entityObj, id: new ObjectId().toString(), registered_at: new Date() }
      );
    }
}

// update one entity --> PUT
const updateEntity = async (entityName, entityId, entityObj) => {
  return await DbClient.db(DB_NAME).collection(entityName).updateOne(
    { 'id': entityId },
    { '$set': entityObj }
  );
}

const deleteEntity = async (entityName, entityId) => {
  return await DbClient.db(DB_NAME).collection(entityName).deleteOne(
    { 'id': entityId });
}

const findOneWithQuery = async (entityName, query) => {
  return await DbClient.db(DB_NAME).collection(entityName).findOne(
    query,
    {
      projection: {
        _id: 0
      }
    }
  );
}

const findAllWithQuery = async (entityName, query) => {
  return await DbClient.db(DB_NAME).collection(entityName).find(
    query,
    {
      projection: {
        _id: 0
      }
    }
  ).toArray();
}

const getChartData = async (entityName, userId, filter) => {
  if(filter === 'month'){
    return await DbClient.db(DB_NAME).collection(entityName).aggregate(
      [
        {
          '$match': {
            'userId': userId
          }
        }, {
          '$addFields': {
            'year': {
              '$year': '$occuredAt'
            }, 
            'month': {
              '$month': '$occuredAt'
            }
          }
        }, {
          '$group': {
            '_id': {
              'type': '$type', 
              'year': '$year', 
              'month': '$month',
              'division':"$division"
            }, 
            'totalAmount': {
              '$sum': '$amount'
            },
            'year' : {
              '$first': '$year'
            }, 
            'month' : {
              '$first': '$month'
            }, 
            'type': {
              '$first': '$type'
            }, 
            'division': {
              '$first': '$division'
            }
          }
        }, {
          '$project': {
            '_id': 0
          }
        }
      ]
    ).toArray();
  }else{
    return await DbClient.db(DB_NAME).collection(entityName).aggregate(
      [
        {
          '$match': {
            'userId': userId
          }
        }, {
          '$addFields': {
            'year': {
              '$year': '$occuredAt'
            }, 
            'month': {
              '$month': '$occuredAt'
            }
          }
        }, {
          '$group': {
            '_id': {
              'type': '$type', 
              'year': '$year',
              'division': '$division'
            }, 
            'totalAmount': {
              '$sum': '$amount'
            },
            'year' : {
              '$first': '$year'
            }, 
            'type': {
              '$first': '$type'
            }, 
            'division': {
              '$first': '$division'
            }
          }
        }, {
          '$project': {
            '_id': 0
          }
        }
      ]
    ).toArray();
  }
  
}

export {
  readAll,
  readOneEntity,
  createEntity,
  updateEntity,
  deleteEntity,
  findAllWithQuery,
  findOneWithQuery,
  getChartData
}
