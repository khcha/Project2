import pandas as pd
import numpy as np

from sqlalchemy import create_engine
from flask import Flask, jsonify, render_template
import gender_guesser.detector as gender

app = Flask(__name__)


#################################################
# Database Setup
#################################################

# app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/lahman2016.sqlite"
# db = SQLAlchemy(app)

engine = create_engine("sqlite:///db/database.sqlite")
d = gender.Detector(case_sensitive=False)

@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

@app.route("/genderSalaryPage")
def genderSalaryPage():
    """Return the homepage."""
    return render_template("genderSalary.html")

@app.route("/jobTitlePage")
def jobTitlePage():
    """Return the homepage."""
    return render_template("jobTitle.html")

@app.route("/baseOvertimePage")
def baseOvertimePage():
    """Return the homepage."""
    return render_template("baseOvertime.html")

@app.route("/salaries/<year>/<male>")
def salaries(year, male):
    conn = engine.connect()

    query = f"""SELECT *
            FROM Salaries
            WHERE TotalPay > 2000
            AND Year = {year}"""

    df = pd.read_sql(query, conn) #execute query
    genders = df.EmployeeName.map(lambda x: d.get_gender(x.split(" ")[0]))

    df["Gender"] = genders
    df["Gender"] = df["Gender"].replace("mostly_male", "male")
    df["Gender"] = df["Gender"].replace(["mostly_female","unknown", "andy"], "female")
    df2 = df.loc[df.Gender == male].reset_index(drop=True)

    #debug log to console
    print(df2.head())

    #close db connection
    conn.close()
    return df2.to_json(orient="index")


@app.route("/jobTitles/<year>/<topBottom>")
def jobTitles(year, topBottom):
    conn = engine.connect()

    asc = False

    if topBottom == "Bottom":
        asc = True

    query = f"""
            SELECT 
                JobTitle, 
                TotalPay,
                EmployeeName                      
            FROM
                Salaries
            WHERE 
                TotalPay > 2000
                AND Year = {year}
            """

    df = pd.read_sql(query, conn) #execute query
    df["JobTitle"] = df.JobTitle.map(lambda x: trimJobTitle(x))
    genders = df.EmployeeName.map(lambda x: d.get_gender(x.split(" ")[0]))

    df["Gender"] = genders
    df["Gender"] = df["Gender"].replace("mostly_male", "male")
    df["Gender"] = df["Gender"].replace(["mostly_female","unknown", "andy"], "female")

    df2 = df.groupby(["JobTitle", "Gender"]).TotalPay.mean().reset_index()
    df2_men = df2.loc[df2.Gender == "male"].sort_values(by='TotalPay', ascending=asc).reset_index(drop=True)
    df2_female = df2.loc[df2.Gender == "female"].sort_values(by='TotalPay', ascending=asc).reset_index(drop=True)

    #debug log to console
    print(df2_men.head())

    #close db connection
    conn.close()
    return {"men": df2_men.to_json(orient="index"), "women": df2_female.to_json(orient="index")}

def trimJobTitle(word):
    tooLong = 35
    newWord = word.title()
    if len(newWord) > tooLong:
        newWord = newWord[0:tooLong] + "...  "
    else:
        newWord = newWord + "  "
    return newWord

@app.route("/genders/<year>")
def genders(year):
    conn = engine.connect()

    query = f"""SELECT *
        FROM Salaries
        WHERE TotalPay > 2000
        AND Year = {year}"""

    df = pd.read_sql(query, conn) #execute query
    genders = df.EmployeeName.map(lambda x: d.get_gender(x.split(" ")[0]))

    df["Gender"] = genders
    df["Gender"] = df["Gender"].replace("mostly_male", "male")
    df["Gender"] = df["Gender"].replace(["mostly_female","unknown", "andy"], "female")

    maleAvg = df.loc[df.Gender == "male", "TotalPay"].mean()
    maleMed = df.loc[df.Gender == "male", "TotalPay"].median()
    maleMax = df.loc[df.Gender == "male", "TotalPay"].max()

    femaleAvg = df.loc[df.Gender == "female", "TotalPay"].mean()
    femaleMed = df.loc[df.Gender == "female", "TotalPay"].median()
    femaleMax = df.loc[df.Gender == "female", "TotalPay"].max()

    df2 = pd.DataFrame()
    df2["Gender"] = ["Male", "Female"]
    df2["AveragePay"] = [maleAvg, femaleAvg]
    df2["MedianPay"] = [maleMed, femaleMed]
    df2["MaxPay"] = [maleMax, femaleMax]
    df2["Year"] = [year, year]

    #close db connection
    conn.close()
    return df2.to_json(orient="index")

if __name__ == "__main__":
    app.run(debug=True)
