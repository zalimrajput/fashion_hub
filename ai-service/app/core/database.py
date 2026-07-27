from pymongo import MongoClient

from app.config import MONGODB_URI, DATABASE_NAME


class Database:

    _client = None
    _db = None

    @classmethod
    def connect(cls):

        if cls._client is None:

            cls._client = MongoClient(MONGODB_URI)

            cls._db = cls._client[DATABASE_NAME]

    @classmethod
    def get_database(cls):

        if cls._db is None:

            cls.connect()

        return cls._db
    


# Why a class?
# Because the entire application shares one MongoClient.
# Creating a new client every request is inefficient.