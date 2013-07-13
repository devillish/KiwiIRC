var fs        = require('fs'),
    path      = require('path'),
    Stream    = require('stream'),
    util      = require('util'),
    uglifyJS  = require('uglify-js'),
    _         = require('lodash'),
    po2json   = require('po2json'),
    browserify= require('browserify'),
    sourcemap = require('mold-source-map'),
    source_map= require('source-map'),
    through   = require('through'),
    config    = require('./../../../server/configuration.js');

var FILE_ENCODING = 'utf-8',
    EOL = '\n';


config.loadConfig();


/**
 * Build the kiwi.js/kiwi.min.js and the sourcemap files
 */
browserify({
    entries: [
        __dirname + '/views/userbox.js', // Must come first so dependencies are traversed in the correct order.
        __dirname + '/app.js',
        __dirname + '/applets/settings.js',     // Applets aren't require()'d from the main code so they're
        __dirname + '/applets/chanlist.js',     // included separately.
        __dirname + '/applets/scripteditor.js'
    ]
})
    .require(__dirname + '/app.js', {expose: 'kiwiirc'})
    .bundle({debug:true})
    .pipe(sourcemap.transform(function (map, cb) {
        // Extract the inlined, base64-encoded, sourcemap from the generated code and write it to its own file
        var out;
        map.sourceRoot((config.get().http_base_path || '/kiwi') + '/assets/src');
        map.mapSources(sourcemap.mapPathRelativeTo(path.join(__dirname)));
        map.file('kiwi.js');
        out = JSON.parse(map.toJSON());
        delete out.sourcesContent;
        out.sources.forEach(function (source, index) {
            out.sources[index] = source.slice(1).replace('\\', '/');
        });
        fs.writeFile('client/assets/kiwi.js.map', JSON.stringify(out), FILE_ENCODING, function (err) {
            if (err) {
                return console.error(err);
            }
            cb('//@ sourceMappingURL=kiwi.js.map');
        });
    }))
    .pipe((function () {
        // Wrap the code in an IIFE so we can include bundle-level "globals", like _kiwi
        var code = '';
        return through(function (data) {
            code += data;
        }, function () {
            var that = this;
            fs.readFile('client/assets/kiwi.js.map', function (err, data) {
                var node,
                    map;
                if (err) {
                    return console.log('Error reading back kiwi.js.map', err);
                } else {
                    node = source_map.SourceNode.fromStringWithSourceMap(
                        code,
                        new source_map.SourceMapConsumer(JSON.parse(data))
                    );
                    map = node.prepend('(function (window, undefined) {\nvar _kiwi = {};\n')
                        .add('})(this);\n')
                        .toStringWithSourceMap({file: 'kiwi.js'}).map.toString();
                    fs.writeFile('client/assets/kiwi.js.map', map, FILE_ENCODING, function (err) {
                        if (err) {
                            return console.error(err);
                        } else {
                            console.log('Built kiwi.js.map');
                            that.queue(node.toString());
                            that.queue(null);
                        }
                    });
                }
            });
        });
    })())
    .pipe((function () {
        // Write out the un-minified code to its own file
        var code = '';
        return through(function (data) {
            code += data;
        }, function () {
            var that = this;
            fs.writeFile('client/assets/kiwi.js', code, FILE_ENCODING, function (err) {
                if (err) {
                    console.log('Error writing to file client/assets/kiwi.js', err);
                }
                else {
                    console.log('Built kiwi.js');
                    that.queue(code);
                    that.queue(null);
                }
            });
        });
    })())
    .pipe((function () {
        // Minify the code, generate a new sourcemap for the minified code and write the sourcemap to a new file
        var code = '';
        return through(function (data) {
            code += data;
        }, function () {
            var ast = uglifyJS.parse(code, {filename: 'kiwi.js'}),
                that = this;
            ast.figure_out_scope();
            ast = ast.transform(uglifyJS.Compressor({warnings: false}));
            ast.figure_out_scope();
            ast.compute_char_frequency();
            ast.mangle_names();
            var source_map = uglifyJS.SourceMap({
                file: 'kiwi.min.js.',
                orig: JSON.parse(fs.readFileSync('client/assets/kiwi.js.map'))
            });
            var stream = uglifyJS.OutputStream({
                source_map: source_map
            });
            ast.print(stream);

            fs.writeFile('client/assets/kiwi.min.js.map', source_map.toString(), FILE_ENCODING, function (err) {
                if (err) {
                    return console.error(err);
                } else {
                    console.log('Built kiwi.min.js.map');
                    that.queue(stream.toString());
                    that.queue('\n//@ sourceMappingURL=kiwi.min.js.map');
                    that.queue(null);
                }
            });
        });
    })())
    .pipe((function () {
        // Write the minified code out to file
        var code = '';
        return through(function (data) {
            code += data;
        }, function () {
            fs.writeFile('client/assets/kiwi.min.js', code, FILE_ENCODING, function (err) {
                if (err) {
                    console.log('Error writing to file client/assets/kiwi.min.js', err);
                }
                else {
                    console.log('Built kiwi.min.js');
                }
            });
        });
    })());



/**
*   Convert translations from .po to .json
*/
if (!fs.existsSync(__dirname + '/../locales')) {
    fs.mkdirSync(__dirname + '/../locales');
}
fs.readdir(__dirname + '/translations', function (err, translation_files) {
    if (!err) {
        translation_files.forEach(function (file) {
            var locale = file.slice(0, -3);

            if ((file.slice(-3) === '.po') && (locale !== 'template')) {
                po2json.parse(__dirname + '/translations/' + file, function (err, json) {
                    if (!err) {
                        fs.writeFile(__dirname + '/../locales/' + locale + '.json', JSON.stringify(json), function (err) {
                            if (!err) {
                                console.log('Built translation file %s.json', locale);
                            } else {
                                console.error('Error building translation file %s.json:', locale, err);
                            }
                        });
                    } else {
                        console.error('Error building translation file %s.json: ', locale, err);
                    }
                });
            }
        });
    } else {
        console.error('Error building translation files:', err);
    }
});






/**
 * Build the index.html file
 */

var index_src = fs.readFileSync(__dirname + '/index.html.tmpl', FILE_ENCODING)
    .replace(new RegExp('<%base_path%>', 'g'), config.get().http_base_path || '/kiwi');

fs.writeFile(__dirname + '/../../index.html', index_src, { encoding: FILE_ENCODING }, function (err) {
    if (!err) {
        console.log('Built index.html');
    } else {
        console.error('Error building index.html');
    }
});
