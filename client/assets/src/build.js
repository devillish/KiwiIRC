var fs        = require('fs'),
    path      = require('path'),
    Stream    = require('stream'),
    util      = require('util'),
    uglifyJS  = require('uglify-js'),
    _         = require('lodash'),
    po2json   = require('po2json'),
    browserify= require('browserify'),
    sourcemap = require('mold-source-map'),
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
        __dirname + '/applets/settings.js',
        __dirname + '/applets/chanlist.js',
        __dirname + '/applets/scripteditor.js'
    ]
})
    .require(__dirname + '/app.js', {expose: 'kiwiirc'})
    .bundle({debug:true})
    .pipe(sourcemap.transform(function (map, cb) {
        var out;
        map.sourceRoot((config.get().http_base_path || '/kiwi') + '/assets/src');
        map.mapSources(sourcemap.mapPathRelativeTo(path.join(__dirname)));
        map.file('kiwi.js');
        out = JSON.parse(map.toJSON());
        delete out.sourcesContent;
        fs.writeFile('client/assets/kiwi.js.map', JSON.stringify(out), FILE_ENCODING, function (err) {
            if (err) {
                return console.error(err);
            }
            cb('//@ sourceMappingURL=kiwi.js.map');
        });
    }))
    .pipe(new ((function () {
        var f = function () {
            Stream.PassThrough.call(this);
            this.pipe(fs.createWriteStream('client/assets/kiwi.js'));
        };
        util.inherits(f, Stream.PassThrough);
        return f;
    })())())
    .pipe((function () {
        var code = '';
        return through(function (data) {
            code += data;
        }, function () {
            var ast = uglifyJS.parse(code, {filename: 'kiwi.js'});
            ast.figure_out_scope();
            ast = ast.transform(uglifyJS.Compressor({warnings: false}));
            ast.figure_out_scope();
            ast.compute_char_frequency();
            ast.mangle_names();
            var clean_map = function (map) {
                map.sources.forEach(function (source, index) {
                    map.sources[index] = source.slice(1).replace('\\', '/');
                });
                return map;
            };
            var source_map = uglifyJS.SourceMap({
                file: 'kiwi.min.js.',
                orig: clean_map(JSON.parse(fs.readFileSync('client/assets/kiwi.js.map')))
            });
            var stream = uglifyJS.OutputStream({
                source_map: source_map
            });
            ast.print(stream);
            fs.writeFile('client/assets/kiwi.min.js.map', source_map.toString(), FILE_ENCODING, function (err) {
                if (err) {
                    return console.error(err);
                }
            });

            this.queue(stream.toString());
            this.queue('\n//@ sourceMappingURL=kiwi.min.js.map');
            this.queue(null);
        });
    })())
    .pipe(new ((function () {
        var f = function () {
            Stream.PassThrough.call(this);
            this.pipe(fs.createWriteStream('client/assets/kiwi.min.js'));
        };
        util.inherits(f, Stream.PassThrough);
        return f;
    })())())
    .pipe((function () {
        return through(function (data) {this.queue(data);}, function () {
            console.log('kiwi.js, kiwi.js.map, kiwi.min.js and kiwi.min.js.map built');
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
