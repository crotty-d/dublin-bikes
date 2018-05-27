# SQLAlchemy and DB configuration
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://<username>:<password>@<host>:3306/bikesdata'

SQLALCHEMY_POOL_RECYCLE = 3600

SQLALCHEMY_TRACK_MODIFICATIONS = False

WTF_CSRF_ENABLED = True

# JCDecaux bike station API address + parameters + key
JCD_STATION_DATA_URI = 'https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=<api key>'

# Openweathermaps API address + parameters + key
WEATHER_DATA_URI = 'http://api.openweathermap.org/data/2.5/weather?id=2964574&appid=<api key>'

# Paths in Flask app to store latest data
LATEST_STATION_DATA_PATH = 'application/static/data/station_data.json'
LATEST_WEATHER_DATA_PATH = 'application/static/data/weather_data.json'