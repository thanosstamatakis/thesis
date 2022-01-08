# Prediction mechanism

## Initial steps

By this point you should have two datasets a training dataset and a testing dataset. These can be quickly converted to `csv` format through excel or a number of online platforms.

You also need to manualy annotate the tie strength values in the training dataset. To do this there are two options:

- Use the [online tool]() I created that uses the friendlist and a user interface with a slider to ask for the tie strength value. After this there is a script called `concat.js` which merges the json dataset `tie_data.json` with the annotated values. Then you can convert to CSV.

- You can convert to CSV and annotate manually in excel.

After these steps are completed just paste the files in this folder named `training_data.csv` & `testing.csv` for training and applying the model respectively.

## Running the scripts

Install the dependencies like so:

```bash
pip install sklearn-contrib-py-earth
pip install pandas
pip install sklearn
pip install numpy
pip install matplotlib
pip install seaborn
```

Then simply run the script:

```bash
python app.py
```

This will generate two csv files where the model has been applied to the testing dataset: `res_linear.csv` and `res_mars.csv` where you can practically assess the potency of each model (Linear or M.A.R.S models).

The format of these files looks like this:

```csv
...
<USER_1_NAME>,<USER_1_TIE_STRENGTH_%>
<USER_2_NAME>,<USER_2_TIE_STRENGTH_%>
<USER_3_NAME>,<USER_3_TIE_STRENGTH_%>
...
```
