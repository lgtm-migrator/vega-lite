"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * Module for compiling Vega-lite spec into Vega spec.
 */
var config_1 = require("../config");
var log = require("../log");
var spec_1 = require("../spec");
var toplevelprops_1 = require("../toplevelprops");
var util_1 = require("../util");
var common_1 = require("./common");
function compile(inputSpec, logger) {
    if (logger) {
        // set the singleton logger to the provided logger
        log.set(logger);
    }
    try {
        // 1. initialize config
        var config = config_1.initConfig(inputSpec.config);
        // 2. Convert input spec into a normal form
        // (Decompose all extended unit specs into composition of unit spec.)
        var spec = spec_1.normalize(inputSpec, config);
        // 3. Instantiate the model with default config
        var model = common_1.buildModel(spec, null, '', null, config);
        // 4. Parse each part of the model to produce components that will be assembled later
        // We traverse the whole tree to parse once for each type of components
        // (e.g., data, layout, mark, scale).
        // Please see inside model.parse() for order for compilation.
        model.parse();
        // 5. Assemble a Vega Spec from the parsed components in 3.
        return assemble(model, getTopLevelProperties(inputSpec, config));
    }
    finally {
        // Reset the singleton logger if a logger is provided
        if (logger) {
            log.reset();
        }
    }
}
exports.compile = compile;
function getTopLevelProperties(topLevelSpec, config) {
    return tslib_1.__assign({}, toplevelprops_1.extractTopLevelProperties(config), toplevelprops_1.extractTopLevelProperties(topLevelSpec));
}
function assemble(model, topLevelProperties) {
    // TODO: change type to become VgSpec
    var output = tslib_1.__assign({ $schema: 'http://vega.github.io/schema/vega/v3.0.json' }, (model.description ? { description: model.description } : {}), { autosize: 'pad' }, topLevelProperties, { data: [].concat(model.assembleSelectionData([]), model.assembleData()), signals: ([].concat(
        // TODO(https://github.com/vega/vega-lite/issues/2198):
        // Merge the top-level's width/height signal with the top-level model
        // so we can remove this special casing based on model.name
        (model.name ? [
            // If model has name, its calculated width and height will not be named width and height, need to map it to the global width and height signals.
            { name: 'width', update: model.getName('width') },
            { name: 'height', update: model.getName('height') }
        ] : []), model.assembleLayoutSignals(), model.assembleSelectionTopLevelSignals([]))) }, assembleNestedMainGroup(model));
    return {
        spec: output
        // TODO: add warning / errors here
    };
}
function assembleNestedMainGroup(model) {
    var _a = model.assembleGroup([]), layout = _a.layout, signals = _a.signals, group = tslib_1.__rest(_a, ["layout", "signals"]);
    var marks = group.marks;
    var hasLayout = !!model.assembleLayout();
    var parentEncodeEntry = tslib_1.__assign({}, (!hasLayout ? {
        width: { signal: 'width' },
        height: { signal: 'height' },
    } : {}), model.assembleParentGroupProperties());
    return tslib_1.__assign({}, group, { marks: [tslib_1.__assign({ name: model.getName('nested_main_group'), type: 'group', layout: layout,
                signals: signals }, (util_1.keys(parentEncodeEntry).length > 0 ? {
                encode: {
                    update: parentEncodeEntry
                }
            } : {}), { marks: marks })] });
}
exports.assembleNestedMainGroup = assembleNestedMainGroup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21waWxlL2NvbXBpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7O0dBRUc7QUFDSCxvQ0FBNkM7QUFDN0MsNEJBQThCO0FBQzlCLGdDQUFrRTtBQUNsRSxrREFBK0U7QUFDL0UsZ0NBQXFDO0FBQ3JDLG1DQUFvQztBQUdwQyxpQkFBd0IsU0FBK0IsRUFBRSxNQUE0QjtJQUNuRixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ1gsa0RBQWtEO1FBQ2xELEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVELElBQUksQ0FBQztRQUNILHVCQUF1QjtRQUN2QixJQUFNLE1BQU0sR0FBRyxtQkFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUU1QywyQ0FBMkM7UUFDM0MscUVBQXFFO1FBQ3JFLElBQU0sSUFBSSxHQUFHLGdCQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTFDLCtDQUErQztRQUMvQyxJQUFNLEtBQUssR0FBRyxtQkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUV2RCxxRkFBcUY7UUFDckYsdUVBQXVFO1FBQ3ZFLHFDQUFxQztRQUNyQyw2REFBNkQ7UUFDN0QsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRWQsMkRBQTJEO1FBQzNELE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ25FLENBQUM7WUFBUyxDQUFDO1FBQ1QscURBQXFEO1FBQ3JELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDWCxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDZCxDQUFDO0lB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