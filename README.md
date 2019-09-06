# VIsualization Tool for Atomic modeLs (VITAL)

This tool is made to allow researchers to interactively visualize the behavior of materials predictions relative to their composition.


## Usage

There are three main steps for using this tool.
Steps 1 and 2 are run from the command line/terminal

1. Process the data using the `main.py` python script:

    Note: This can be done using (a) the predictions by themselves, we will do PCA using our own featurization, or (b) using your predictions and your features.

    a. `python main.py --predictions user_data/example_predictions_Eg.csv`

    b. `python main.py --predictions user_data/example_predictions_Eg.csv --features user_data/example_features_Eg.csv`

2. Open up a server for for the visualization tool to run from (we will open this to port 8000)
    change directories
    `cd js_code`
    then start local server
    `python -m http.server 8000`

3. Navigate to http://localhost:8000/ using your browser of choice. This will open the tool for you to use. We suggest using an incognito/private window.
