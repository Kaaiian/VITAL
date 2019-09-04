import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, normalize
from sklearn.decomposition import PCA
from composition import generate_features as gf

# %%

all_symbols = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na',
               'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc',
               'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga',
               'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr', 'Nb',
               'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb',
               'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm',
               'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu',
               'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl',
               'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa',
               'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md',
               'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg',
               'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og']

# %%


##############
# DELETE ME

#
#class empty():
#    pass
#
#
#self = empty()


# ############
# %%


class GetData():
    def __init__(self, data_path, feature_path=None, scale_feats=True):
        self.data_path = data_path
        self.feature_path = feature_path
        self.scale_feats = scale_feats
        self.all_symbols = all_symbols
        self.df_ptable = pd.read_csv('js_code/data/ptable.csv', index_col=0)
        self.parse_data()
        self.get_components()
        self.to_csv()
        self.make_element_data()
        self.data = pd.read_csv('js_code/data/experimental_predictions.csv',
                                index_col=0)
        self.make_ptable()
        self.make_hist_data()

    def parse_data(self):
        df = pd.read_csv(self.data_path)
        df_simple = df.copy().iloc[:, 0:2]
        df_simple.columns = ['formula', 'target']
        self.df_simple = df_simple
        df.columns = ['formula', 'actual', 'predicted']
        elem_regex = r'[A-Z][a-z]*'
        processing = df['formula'].str.findall(elem_regex)
        processing = processing.astype(str).str.replace('[', '')
        processing = processing.astype(str).str.replace(']', '')
        processing = processing.astype(str).str.replace("'", '')
        processed_str = processing.astype(str).str.replace(',', '')
        df['elements'] = processed_str
        df['residual'] = df['predicted'] - df['actual']
        self.df = df

    def get_components(self):
        if self.feature_path:
            X = pd.read_csv(self.feature_path, index_col=0)
        else:
            X, y, formulae, skipped = gf(self.df_simple, elem_prop='mat2vec')
        if self.scale_feats:
            scale = StandardScaler()
            X = normalize(scale.fit_transform(X))
        pca = PCA(n_components=5)
        X_pca = pca.fit_transform(X)
        self.df['component_1'] = X_pca[:, 0]
        self.df['component_2'] = X_pca[:, 1]

    def to_csv(self):
        self.df.to_csv('js_code/data/experimental_predictions.csv',
                       index=False)

    def make_element_data(self):
        elem_data = pd.Series(index=all_symbols)
        elem_count = pd.Series(index=all_symbols)
        elem_res = pd.Series(index=all_symbols)
        elem_pred = pd.Series(index=all_symbols)
        elem_act = pd.Series(index=all_symbols)
        for element in self.all_symbols:
            # get element_data files
            df_elem = self.df[self.df['elements'].str.contains(element)]
            df_elem = df_elem.iloc[:, 0:5]
            df_elem.to_csv('js_code/data/element_data/' + element + '.csv',
                           index=False)
            if df_elem.shape[0] == 0:
                elem_data[element] = 0
            else:
                elem_data[element] = 1
            elem_count[element] = df_elem.shape[0]
            elem_res[element] = df_elem['residual'].mean()
            elem_pred[element] = df_elem['predicted'].mean()
            elem_act[element] = df_elem['actual'].mean()
        self.elem_data = elem_data.fillna(0)
        self.elem_count = elem_count.fillna(0)
        self.elem_res = elem_res.fillna(0)
        self.elem_pred = elem_pred.fillna(0)
        self.elem_act = elem_act.fillna(0)

    def make_ptable(self):
        self.df_ptable['data'] = self.elem_data
        self.df_ptable['count'] = self.elem_count
        self.df_ptable['average_residual'] = self.elem_res
        self.df_ptable['average_predicted'] = self.elem_pred
        self.df_ptable['average_actual'] = self.elem_act
        self.df_ptable.to_csv('js_code/data/ptable.csv',
                              index_label='symbol')

    def make_hist_data(self):
        df_data = self.data.copy()
        for element in self.all_symbols:
            element_index = df_data['elements'].str.contains(element )
            df_elem = df_data[element_index].copy()
            if df_elem.shape[0] != 0:
                bins = np.linspace(df_elem['residual'].min()-0.001,
                                   df_elem['residual'].max()+0.001,
                                   21)
                labels = list(np.arange(0, 20, 1))
                df_elem['bin_number'] = pd.cut(df_elem['residual'],
                                               20,
                                               labels=labels)
                df_elem['bin_range'] = pd.cut(df_elem['residual'], bins)
                df_elem_hist = pd.DataFrame()
                df_elem_hist['bin_count'] = df_elem['bin_number'].\
                    value_counts().values
                df_elem_hist['bin_freq'] = df_elem_hist['bin_count'] / \
                    len(df_elem)
                df_elem_hist['bin_range'] = df_elem['bin_range'].\
                    value_counts().index.values
                df_elem_hist['x_value'] = df_elem_hist['bin_range'].\
                    astype(str).str.split(',', 1, expand=True)[0].\
                    str.replace('(', '').astype(float)
                df_elem_hist.sort_values(by=['x_value'], axis=0, inplace=True)
                df_elem_hist['bin_number'] = np.arange(1,21,1)
                df_elem_hist.to_csv('js_code/data/hist_data/'+
                                    element+'_hist.csv', index=False)
            else:
                df_elem_hist = pd.DataFrame()
                df_elem_hist['bin_count'] = np.zeros(20)
                df_elem_hist['bin_freq'] = np.zeros(20)
                df_elem_hist['bin_range'] = pd.cut(pd.Series(np.linspace(-4.99, 5+0.001, 20)), np.linspace(-5, 5+0.001, 21))
                df_elem_hist['x_value'] = df_elem_hist['bin_range'].astype(str).str.split(',', 1, expand=True)[0].str.replace('(', '').astype(float)
                df_elem_hist.sort_values(by=['x_value'], axis=0, inplace=True)
                df_elem_hist['bin_number'] = pd.cut(pd.Series(np.linspace(-4.99, 5+0.001, 20)), 20, labels=list(np.arange(0, 20, 1)))
                df_elem_hist.to_csv('js_code/data/hist_data/'+element+'_hist.csv', index=False)

# %%



