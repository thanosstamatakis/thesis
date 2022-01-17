import pandas as pd
import numpy as np
from sklearn import linear_model, svm
from pyearth import Earth
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import warnings
import csv
import seaborn as sn
import matplotlib.pyplot as plt

def write_to_file(filename, header, data):
    with open(filename, "w", encoding="UTF8", newline="") as f:
        writer = csv.writer(f)

        # write the header
        writer.writerow(header)

        # write multiple rows
        writer.writerows(data)


warnings.filterwarnings('ignore')

df = pd.read_csv("training_data.csv")
reg = linear_model.LinearRegression()

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


# Fit model to training data
linear_fitted = reg.fit(X,y)
y_pred = reg.predict(X)
r2 = r2_score(y,y_pred)
ar2 = 1 - (1-r2)*(len(y)-1)/(len(y)-len(linear_fitted.coef_)-1)
print('Rsquared Linear:', r2)
print('Adjusted Rsquared Linear:', ar2)
print('MSE Linear:',mean_squared_error(y,y_pred))
print('MAE Linear:',mean_absolute_error(y,y_pred), '\n\n')
# Multivariable linear regression
people = []
predictions = []

with open("testing.csv", "r", encoding="UTF8") as file:
    reader = csv.reader(file)
    next(reader)

    for row in reader:
        # row_nums = row[1 : 2] + row[6:7] + row[10:19] + row[22:23]
        row_nums = row[1:23]
        for i in range(0, len(row_nums)):
            row_nums[i] = int(row_nums[i])

        pred = reg.predict([row_nums])

        people.append(row[0])
        predictions.append(pred[0])

res = [list(a) for a in sorted(zip(predictions, people))]
write_to_file('res_linear.csv', ["tie_strength, friend"], res)

# M.A.R.S regression
people = []
predictions = []

MARS_model = Earth(max_terms=1000, max_degree=1)
MARS_model_fitted = MARS_model.fit(X,y)

y_pred = MARS_model_fitted.predict(X)
r2 = r2_score(y,y_pred)
ar2 = 1 - (1-r2)*(len(y)-1)/(len(y)-len(MARS_model.coef_)-1)
print('Rsquared MARS:', r2)
print('Adjusted Rsquared MARS:', ar2)
print('MSE MARS:',mean_squared_error(y,y_pred))
print('MAE MARS:',mean_absolute_error(y,y_pred), '\n\n')

with open("testing.csv", "r", encoding="UTF8") as file:
    reader = csv.reader(file)
    next(reader)

    for row in reader:
        # row_nums = row[1 : 2] + row[6:7] + row[10:19] + row[22:23]
        row_nums = row[1:23]

        for i in range(0, len(row_nums)):
            row_nums[i] = int(row_nums[i])

        pred = MARS_model_fitted.predict([row_nums])
        people.append(row[0])
        predictions.append(pred[0])

for i,pr in enumerate(predictions):
    if (pr > 100):
        predictions[i] = 100
    elif (pr < 0):
        predictions[i] = 0

res = [list(a) for a in sorted(zip(predictions, people))]
write_to_file('res_mars.csv', ["tie_strength, friend"], res)

# SVR regression model

SVR_model = svm.SVR()

# Fit model to training data
SVR_model_fitted = SVR_model.fit(X,y)
y_pred = SVR_model.predict(X)
r2 = r2_score(y,y_pred)
ar2 = 1 - (1-r2)*(len(y)-1)/(len(y)-len(linear_fitted.coef_)-1)
print('Rsquared SVR:', r2)
print('Adjusted Rsquared SVR:', ar2)
print('MSE SVR:',mean_squared_error(y,y_pred))
print('MAE SVR:',mean_absolute_error(y,y_pred), '\n\n')
# SVR regression on test dataset
people = []
predictions = []

with open("testing.csv", "r", encoding="UTF8") as file:
    reader = csv.reader(file)
    next(reader)

    for row in reader:
        # row_nums = row[1 : 2] + row[6:7] + row[10:19] + row[22:23]
        row_nums = row[1:23]
        for i in range(0, len(row_nums)):
            row_nums[i] = int(row_nums[i])

        pred = SVR_model.predict([row_nums])

        people.append(row[0])
        predictions.append(pred[0])

res = [list(a) for a in sorted(zip(predictions, people))]
write_to_file('res_svr.csv', ["tie_strength, friend"], res)

# Correlation analysis
fig_dims = (12, 12)
fig, ax = plt.subplots(figsize=fig_dims)
sn.heatmap(X.corr(), ax=ax)
plt.savefig('temp.png', dpi=fig.dpi)
print(abs(df[["like",
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
            "days_since_last_contact",
            "tie_strength"]].corr()['tie_strength']))
