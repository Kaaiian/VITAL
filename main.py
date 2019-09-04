from process_data import GetData
import argparse

parser_desc = 'Select files for visualization'
parser = argparse.ArgumentParser(description=parser_desc)

parser.add_argument('--predictions',
                    type=str,
                    help=('example:\n\t' +
                          'python main.py --predictions ' +
                          'user_data/example_predictions_Eg.csv\n\t'))

parser.add_argument('--features',
                    type=str,
                    default='none',
                    help=('example:\n\t' +
                          'python main.py --features ' +
                          'user_data/example_features_Eg.csv\n\t'))

args = parser.parse_args()

data_path = args.predictions
print(data_path)
feat_path = args.features
print(feat_path)

if feat_path == 'none':
    feat_path = None

gd = GetData(data_path, feat_path)

print('finished processing data.\n\t')
print('- Start a local server using "python -m http.server 8000"')
print('- then navigate to "http://localhost:8000/" in your prefered browser.\n'
      'Note. If you allow cookies, use priviate browsing to prevent data from '
      'previous sessions being stored.')
