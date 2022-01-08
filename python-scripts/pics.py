import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_csv("training_data.csv")

# Select dependent and independent variables
X = df[
        [
            "like",
            "care",
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
            "days_since_last_contact"
        ]
    ]
y = df.tie_strength

# X = X.apply(lambda x: x/x.max(), axis=0)
font = {'family' : 'IBM Plex Mono',
        'weight' : 'bold',
        'size'   : 18}

cols = X.columns.tolist()
for col in cols:
    fig = plt.scatter(X[col].to_list(), y)
    plt.xlabel(col, **font)
    plt.ylabel('tie_strength',**font)
    plt.savefig(f'pics/{col}')
    plt.clf()
