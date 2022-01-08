import pandas as pd
import numpy as np
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error, confusion_matrix
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

training_frame = pd.read_csv("training_data.csv")
features = [
            "like",
            # "care",
            # "wow",
            # "sad",
            # "laugh",
            # "love",
            # "angry",
            # "personal_encounters",
            "chat_dates",
            "messages_incoming",
            "messages_outgoing",
            # "video_chats_incoming",
            # "video_chats_outgoing",
            # "videos_incoming",
            # "videos_outgoing",
            "photos_incoming",
            "photos_outgoing",
            "days_of_communication",
            "unique_dates",
            "same_dates",
            "mutual_friends",
            "tie_strength"
        ]

def get_classified_dataset(df, fts, its):
    max_features = ((training_frame[features].mean()/2).round().astype(int))

    bins = pd.DataFrame()

    for col in training_frame.columns:
        if(col in features):
            bins[col] = [0, max_features[col], max_features[col]*2, max_features[col]*3,max_features[col]*4,float('inf')]

    classified = pd.DataFrame()
    for col in training_frame.columns:
        if(col in features and col != 'tie_strength'):
            bin_values = bins[col].to_list()
            classified[col] = pd.cut(x=training_frame[col], bins=bin_values, include_lowest=True, labels=[1,2,3,4,5], right=False )

    if its:
        classified['tie_strength'] = pd.cut(x=training_frame['tie_strength'], bins=[0,20,40,60,80,100], include_lowest=True, labels=[1,2,3,4,5])

    return classified

classified = get_classified_dataset(training_frame, features, True)
X_train, X_test, y_train, y_test = train_test_split(classified.drop(['tie_strength'], axis='columns'),classified.tie_strength,test_size=0.1)

print(X_train,y_train)

model = RandomForestClassifier(n_estimators=2000)
rf_model = model.fit(X_train,y_train)

print(rf_model.score(X_test,y_test))
y_predicted = rf_model.predict(X_test)

testing_frame = pd.read_csv("testing.csv")
features.remove('tie_strength')
# print(testing_frame[features])
classified = get_classified_dataset(testing_frame[features], features, False)
# print(classified)
res = rf_model.predict(classified)

people = []
predictions = []

for index,user in enumerate(testing_frame['user'].to_list()):
    people.append(user)
    predictions.append(res[index])

res = [list(a) for a in sorted(zip(predictions, people))]
for item in res: 
    print(item[1], ' ', item[0])
