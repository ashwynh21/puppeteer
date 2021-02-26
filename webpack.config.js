const path = require('path');

module.exports = {
    mode: 'development',

    context: path.join(__dirname, 'lib'),

    entry: {
        index: './index.ts'
    },

    module: {
        rules: [
            {
                test: /\.(json)$/,
                use: ['file-loader'],
                exclude: [__dirname],
            }
        ],
    },
    target: 'node',
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },

    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, 'build')
    },
};
