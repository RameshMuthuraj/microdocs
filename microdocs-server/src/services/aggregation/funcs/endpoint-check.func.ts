import {Path, Project, Parameter, ParameterPlacings, ProblemLevels, SchemaTypes, Schema} from "@maxxton/microdocs-core/domain";
import {ProblemReporter, SchemaHelper} from "@maxxton/microdocs-core/helpers";

export function checkQueryParameters(clientEndpoint: Path, producerEndpoint: Path, clientProject: Project, producerProject: Project, problemReport: ProblemReporter): void {
  if (producerEndpoint.parameters) {
    let parameters = producerEndpoint.parameters.filter(param => param.in === ParameterPlacings.QUERY);
    let clientParams = clientEndpoint.parameters;
    parameters.forEach(producerParam => {
      var exists = false;
      if (clientParams) {
        clientParams.forEach(clientParam => {
          if (producerParam.name == clientParam.name && producerParam.in == clientParam.in) {
            exists = true;
            if (!matchType(producerParam, clientParam)) {
              problemReport.report(ProblemLevels.WARNING, "Type mismatches query parameter '" + producerParam.name + "', expected: '" + producerParam.type + "', found: '" + clientParam.type + "'", clientEndpoint.controller, clientEndpoint.method);
            }
            return true;
          }
          return false;
        });
      }
      if (!exists && producerParam.required) {
        problemReport.report(ProblemLevels.ERROR, "Missing query parameter '" + producerParam.name + "'", clientEndpoint.controller, clientEndpoint.method);
      }
    });
  }
}

export function checkPathParameters(clientEndpoint: Path, producerEndpoint: Path, clientProject: Project, producerProject: Project, problemReport: ProblemReporter): void {
  // match via wildcards in regexp
  var expression = '^' + producerEndpoint.path.replace(new RegExp("\/", 'g'), '\/').replace(new RegExp("\\{.*?\\}", 'g'), '(.+)') + '$';
  var clientExp = new RegExp(expression);
  var producerExp = new RegExp("\\{.*?\\}", 'g');
  var clientMatches: string[] = clientEndpoint.path.match(clientExp);
  var producerMatches: string[] = producerEndpoint.path.match(producerExp);

  if (clientMatches && producerMatches && clientMatches.length == producerMatches.length + 1 && clientMatches.length >= 1) {
    for (let i = 1; i < clientMatches.length; i++) {
      let producerParamName = producerMatches[i - 1].substr(1, producerMatches[i - 1].length - 2);
      let producerParam = getPathVariable(producerParamName, producerEndpoint);
      if (producerParam == null) {
        problemReport.report(ProblemLevels.ERROR, "path variable '" + producerParamName + "' is missing on the controller", clientEndpoint.controller, clientEndpoint.method);
      } else {
        let clientParamName = clientMatches[i];
        if (clientParamName.match(/^\{.*?\}$/)) {
          var clientParam = getPathVariable(clientParamName.substr(1, clientParamName.length - 2), clientEndpoint);
          if (clientParam == null) {
            problemReport.report(ProblemLevels.ERROR, "path variable '" + clientParamName.substr(1, clientParamName.length - 2) + "' is missing", clientEndpoint.controller, clientEndpoint.method);
          }
          if (clientParam != null && producerParam != null) {
            if (!matchType(producerParam, clientParam)) {
              problemReport.report(ProblemLevels.WARNING, "Type mismatches path variable '" + clientParamName.substr(1, clientParamName.length - 2) + "', expected: " + producerParam.type + ", found: " + clientParam.type, clientEndpoint.controller, clientEndpoint.method);
            }
          }
        } else {
          var value = clientParamName;
          switch (producerParam.type.toLowerCase()) {
            case SchemaTypes.NUMBER:
            case SchemaTypes.INTEGER:
              if (!parseInt(value)) {
                problemReport.report(ProblemLevels.WARNING, "Type mismatches path variable '" + producerParamName + "' is not a number', expected: " + producerParam.type + ", found: number", clientEndpoint.controller, clientEndpoint.method);
              }
              break;
          }
        }
      }
    }
  }
}

function getPathVariable(name: string, path: Path): Parameter {
  if (path.parameters != undefined && path.parameters != null) {
    for (let i = 0; i < path.parameters.length; i++) {
      let param = path.parameters[i];
      if (param.name == name && param.in == ParameterPlacings.PATH) {
        return param;
      }
    }
  }
  return null;
}

export function checkBodyParameters(clientEndpoint: Path, producerEndpoint: Path, clientProject: Project, producerProject: Project, problemReport: ProblemReporter): void {
  if (producerEndpoint.parameters) {
    let parameters = producerEndpoint.parameters.filter(param => param.in === ParameterPlacings.BODY);
    let clientParams = clientEndpoint.parameters;
    parameters.forEach(producerParam => {
      let exists = false;
      clientParams.some(clientParam => {
        if (producerParam.in == clientParam.in) {
          exists = true;
          var producerSchema: Schema = SchemaHelper.collect(producerParam.schema, [], producerProject);
          var clientSchema = SchemaHelper.collect(clientParam.schema, [], clientProject);
          checkSchema(clientEndpoint, clientSchema, producerSchema, clientProject, producerProject, problemReport, "", 'request');
          return true;
        }
        return false;
      });
      if (!exists && producerParam.required) {
        problemReport.report(ProblemLevels.ERROR, "Missing request body", clientEndpoint.controller, clientEndpoint.method);
      }
    });
  }
}

export function checkResponseBody(clientEndpoint: Path, producerEndpoint: Path, clientProject: Project, producerProject: Project, problemReport: ProblemReporter): void {
  if (clientEndpoint.responses != undefined && clientEndpoint.responses != null &&
    clientEndpoint.responses['default'] != undefined && clientEndpoint.responses['default'] != null &&
    clientEndpoint.responses['default'].schema != undefined && clientEndpoint.responses['default'].schema != null) {

    if (producerEndpoint.responses != undefined && producerEndpoint.responses != null &&
      producerEndpoint.responses['default'] != undefined && producerEndpoint.responses['default'] != null &&
      producerEndpoint.responses['default'].schema != undefined && producerEndpoint.responses['default'].schema != null) {

      let producerSchema = SchemaHelper.collect(producerEndpoint.responses['default'].schema, [], producerProject);
      let clientSchema = SchemaHelper.collect(clientEndpoint.responses['default'].schema, [], clientProject);
      checkSchema(clientEndpoint, clientSchema, producerSchema, clientProject, producerProject, problemReport, '', 'response');
    } else {
      problemReport.report(ProblemLevels.ERROR, "There is no response body", clientEndpoint.controller, clientEndpoint.method);
    }
  }
}


function checkSchema(endpoint: Path, clientSchema: Schema, producerSchema: Schema, clientProject: Project, producerProject: Project, problemReport: ProblemReporter, path: string, placing: 'request'|'response'): void {
  if (producerSchema != null && producerSchema != undefined) {
    if (clientSchema != null && clientSchema != undefined) {
      if (!matchType(clientSchema, producerSchema)) {
        let position = "";
        if (path != '') {
          position = ' at ' + path;
        }
        problemReport.report(ProblemLevels.WARNING, "Type mismatches in " + placing + " body" + position + ", expected: " + producerSchema.type + ", found: " + clientSchema.type, endpoint.controller, endpoint.method);
      } else {
        if (producerSchema.type == SchemaTypes.OBJECT) {
          let producerViews = collectViews(producerSchema);
          let clientViews = collectViews(clientSchema);

          // Check each view for problems
          let problemReporters: ProblemReporter[] = [];
          producerViews.forEach(producerView => {
            clientViews.forEach(clientView => {
              let reporter = new ProblemReporter(problemReport.getRootObject());
              problemReporters.push(reporter);

              let producerProperties = producerView.properties;
              let clientProperties = clientView.properties;

              // Check each producer properties
              if (producerProperties) {
                for (let key in producerProperties) {
                  // Find client Property by name
                  let producerProperty = producerProperties[key];
                  if (!isProducerIgnored(producerProperty)) {
                    let propertyName = getProducerPropertyMappingName(key, producerProperty);
                    let clientProperty = findClientPropertyByName(propertyName, clientProperties);

                    checkSchema(endpoint, clientProperty, producerProperty, clientProject, producerProject, reporter, path + (path == '' ? '' : '.') + key, placing);
                  }
                }
              }

              // Check unknown client properties
              if (clientProperties) {
                for (let key in clientProperties) {
                  let clientProperty = clientProperties[key];
                  if (!isClientIgnored(clientProperty)) {
                    let name = getClientPropertyMappingName(key, clientProperty);

                    let producerProperty:Schema = null;
                    if(producerProperties) {
                      producerProperty = findProducerPropertyByName(name, producerProperties);
                    }
                      if (!producerProperty) {
                        let keyPath = path + (path ? '.' : '') + key;
                        reporter.report(ProblemLevels.WARNING, `Unknown property '${keyPath}' in ${placing} body`, endpoint.controller, endpoint.method);
                      }
                  }
                }
              }

              // Decorate problems with view info
              if(producerViews.length > 1 || clientViews.length > 1) {
                reporter.getRawProblems().forEach(problem => {
                  problem.message = "[" + clientView.name + " > " + producerView.name + "] " + problem.message;
                });
              }
            });
          });

          if (problemReporters.filter(reporter => !reporter.hasProblems()).length == 0) {
            // No matching view
            if (problemReporters.length > 1) {
              let position = "";
              if (path != '') {
                position = ' at ' + path;
              }
              problemReport.report(ProblemLevels.ERROR, `No matching view in ${placing} body${position}`, endpoint.controller, endpoint.method);
            }
            problemReporters.forEach(r => {
              r.getRawProblems().forEach(problem => {
                problemReport.getRawProblems().push(problem);
              });
            });
          }

        } else if (producerSchema.type == SchemaTypes.ARRAY) {
          let producerItems = producerSchema.items;
          let clientItems = clientSchema.items;
          checkSchema(endpoint, clientItems, producerItems, clientProject, producerProject, problemReport, path + (path == '' ? '' : '.') + "0", placing);
        }
      }
    } else {
      if (producerSchema.required) {
        problemReport.report(ProblemLevels.ERROR, `Missing required property '${path}' in ${placing} body`, endpoint.controller, endpoint.method);
      }
    }
  }
}

function matchType(clientParam: Parameter, producerParam: Parameter): boolean {
  // Full match
  if (producerParam.type === clientParam.type) {
    return true;
  }

  // Match any
  if (producerParam.type === SchemaTypes.ANY || clientParam.type === SchemaTypes.ANY) {
    return true;
  }

  // Match number === integer
  if ((producerParam.type === SchemaTypes.INTEGER && clientParam.type === SchemaTypes.INTEGER) ||
    (producerParam.type === SchemaTypes.INTEGER && clientParam.type === SchemaTypes.INTEGER)) {
    return true;
  }

  // Match enum
  if (producerParam.type === SchemaTypes.ENUM && producerParam.enum && clientParam.default) {
    if (producerParam.enum.indexOf(clientParam.default) > -1) {
      return true;
    }
  } else if (producerParam.type === SchemaTypes.ENUM && clientParam.type === SchemaTypes.STRING) {
    return true;
  }

  // Match reverse enum
  if (clientParam.type === SchemaTypes.ENUM && clientParam.enum && clientParam.enum.length > 0) {
    if (producerParam.type === SchemaTypes.INTEGER || producerParam.type === SchemaTypes.NUMBER) {
      if (typeof(clientParam.enum[0]) === 'number' || !isNaN(parseInt(clientParam.enum[0]))) {
        return true;
      }
    } else if (producerParam.type === SchemaTypes.BOOLEAN) {
      if (typeof(clientParam.enum[0]) === 'boolean' || clientParam.enum[0] === 'true' || clientParam.enum[0] === 'false') {
        return true;
      }
    } else if (producerParam.type === SchemaTypes.STRING) {
      if (typeof(clientParam.enum[0]) === 'string') {
        return true;
      }
    }
  }

  return false;
}

/**
 * Find matching client property by name and ignore
 * @param name
 * @param properties
 * @returns {Schema}
 */
function findClientPropertyByName(name: string, properties: {[key: string]: Schema}): Schema {
  return Object.keys(properties)
  // Filter json.ignore
    .filter(key => {
      let property = properties[key];
      if (property.mappings && property.mappings.json && property.mappings.json.ignore) {
        return false;
      }
      return true;
    })
    // Filter client.ignore
    .filter(key => {
      let property = properties[key];
      if (property.mappings && property.mappings.client && property.mappings.client.ignore) {
        return false;
      }
      return true;
    })
    // Filter name
    .filter(key => {
      let property = properties[key];
      let propertyName = getClientPropertyMappingName(key, property);
      return propertyName === name;
    }).map(clientKey => properties[clientKey])[0];
}

/**
 * Find matching producer property by name and ignore
 * @param name
 * @param properties
 * @returns {Schema}
 */
function findProducerPropertyByName(name: string, properties: {[key: string]: Schema}): Schema {
  return Object.keys(properties)
  // Filter json.ignore
    .filter(key => {
      let property = properties[key];
      if (property.mappings && property.mappings.json && property.mappings.json.ignore) {
        return false;
      }
      return true;
    })
    // Filter name
    .filter(key => {
      let property = properties[key];
      let propertyName = getProducerPropertyMappingName(key, property);
      return propertyName === name;
    }).map(clientKey => properties[clientKey])[0];
}

/**
 * Get Client property name
 * Taking mappings in account
 * @param key
 * @param property
 * @returns {string}
 */
function getClientPropertyMappingName(key: string, property: Schema): string {
  if (property.mappings) {
    if (property.mappings.client && property.mappings.client.name) {
      // Find client.name
      return property.mappings.client.name;
    }
    if (property.mappings.json && property.mappings.json.name) {
      // Find json.name
      return property.mappings.json.name;
    }
  }
  // Fallback on key
  return key;
}

/**
 * Get Producer property name
 * Taking mappings in account
 * @param key
 * @param property
 * @returns {string}
 */
function getProducerPropertyMappingName(key: string, property: Schema): string {
  if (property.mappings) {
    if (property.mappings.json && property.mappings.json.name) {
      // Find json.name
      return property.mappings.json.name;
    }
  }
  // Fallback on key
  return key;
}

/**
 * Check if property is not ignored on client side
 * @param property
 * @returns {boolean}
 */
function isClientIgnored(property: Schema): boolean {
  if (property.mappings) {
    if (property.mappings.json && property.mappings.json.ignore) {
      return true;
    }
    if (property.mappings.client && property.mappings.client.ignore) {
      return true;
    }
  }
  return false;
}

/**
 * Check if property is not ignored on producer side
 * @param property
 * @returns {boolean}
 */
function isProducerIgnored(property: Schema): boolean {
  if (property.mappings) {
    if (property.mappings.json && property.mappings.json.ignore) {
      return true;
    }
  }
  return false;
}

function collectViews(schema: Schema): Schema[] {
  let views = [schema];
  if (schema.anyOf) {
    schema.anyOf.forEach(view => {
      let baseCopy: Schema = {};
      for (let key in schema) {
        if (key !== 'anyOf') {
          baseCopy[key] = schema[key];
        }
      }
      SchemaHelper.merge(baseCopy, view);
      views.push(baseCopy);
    });
  }
  return views;
}