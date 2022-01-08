import pandas as pd
import numpy as np
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import warnings
import csv
from sklearn.ensemble import RandomForestClassifier

def write_to_file(filename, header, data):
    with open(filename, "w", encoding="UTF8", newline="") as f:
        writer = csv.writer(f)

        # write the header
        writer.writerow(header)

        # write multiple rows
        writer.writerows(data)


warnings.filterwarnings('ignore')

df = pd.read_csv("training_data.csv")
features = [
            "like",
            # "care",
            "wow",
            "sad",
            "laugh",
            "love",
            "angry",
            "personal_encounters",
            "chat_dates",
            "messages_incoming",
            "messages_outgoing",
            "video_chats_incoming",
            "video_chats_outgoing",
            "videos_incoming",
            "videos_outgoing",
            "photos_incoming",
            "photos_outgoing",
            "days_of_communication",
            "unique_dates",
            "same_dates",
            "mutual_friends",
        ]
# Select dependent and independent variables
X = df[features]

for index, user in df.iterrows():
    ts = user['tie_strength']
    user_name = user['user']
    tszone = 0
    if (ts >= 0 and ts <=20):
        tszone = 1
    elif (ts > 20 and ts <=40):
        tszone = 2
    elif (ts > 40 and ts <=60):
        tszone = 3
    elif (ts > 60 and ts <=80):
        tszone = 4
    elif (ts > 80 and ts <=100):
        tszone = 5

    df['ts_zone'] = tszone

y = df.tie_strength
print(y)

model = RandomForestClassifier(n_estimators=2000)
rf_model = model.fit(X,y)

test_data_df = pd.read_csv("testing.csv")
X_test = test_data_df[features]

y_pred = model.predict(X_test)


test_data_df['pred'] = y_pred

people = []
predictions = []

for index, row in test_data_df.iterrows():
    people.append(row['user'])
    predictions.append(row['pred'])

res = [list(a) for a in sorted(zip(predictions, people))]
for item in res: 
    print(item[1], ' ', item[0])
