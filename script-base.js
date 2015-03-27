/*global process, module, require */
(function() {
    var fs = require("fs");
    var util = require("util");
    var path = require("path");
    var yosay = require("yosay");
    var yeoman = require("yeoman-generator");
    var openUI5Utils = require("./utils.js");
    var chalk = require("chalk");

    var Generator = module.exports = function Generator() {
        yeoman.generators.Base.apply(this, arguments);
    };

    util.inherits(Generator, yeoman.generators.Base);


    /**
     * Prompt to get the basic details for all apps.
     */
    Generator.prototype.promptForBasicDetails = function() {
        var cb = this.async();

        // Have Yeoman greet the user.
        this.log(yosay(
            'Bem vindo! Vou precisar de alguma informação'
        ));

        var prompts = [{
            name: "applicationName",
            message: "Qual o nome da aplicação?",
            default: "MyApp"
        }, {
            name: "appDescription",
            message: "Descrição da aplicação"
        }, {
            name: "authorName",
            message: "Qual o nome do autor?",
            default: "John Rambo"
        }, {
            name: "gitRepository",
            message: "Qual o repositório git?",
            default: "ssh://github.com/repository/url.git"
        }, {
            name: "licenseType",
            message: "Qual a licença?",
            default: "Apache License, Version 2.0"
        }];

        this.prompt(prompts, function(props) {
            this.applicationName = props.applicationName;
            this.appDescription = props.appDescription;
            this.authorName = props.authorName;
            this.gitRepository = props.gitRepository;
            this.licenseType = props.licenseType;

            cb();
        }.bind(this));
    };



    /**
     * Prompt to get the UI5 Location string for the bootstrap
     * Note - the bower option is not the official OpenUI5 bower
     * library that has recently been made available.
     *
     * Sets global variables:
     * this.openUI5LocationOption: bower or custom
     * this.openUI5Location: full path including sap-ui-core.js
     * this.originalOpenUI5Location: full path excluding sap-ui-core.js used
     *                               only for custom local paths.
     */
    Generator.prototype.promptForUI5Location = function() {

        var cb = this.async();

        var openUI5LocationPrompt = [{
            type: "list",
            name: "openUI5LocationOption",
            message: "Onde está o OpenUI5??",
            choices: [{
                name: "Download com Bower",
                value: "bower"
            }, {
                name: "Indicar uma localização",
                value: "custom"
            }]
        }, {
            when: function(response) {
                return (response.openUI5LocationOption === "custom");
            },
            name: "openUI5Location",
            message: "Onde está localizado o 'sap-ui-core.js'?",
            default: "https://openui5.hana.ondemand.com/resources"
        }];

        this.prompt(openUI5LocationPrompt, function(props) {
            this.openUI5LocationOption = props.openUI5LocationOption;

            // Create full path
            if (this.openUI5LocationOption === "bower") {
                this.openUI5Location = "bower_components/openui5-bower/resources";
            } else {
                this.openUI5Location = props.openUI5Location;
            }

            if (this.openUI5Location.slice(-1) !== "/") {
                this.openUI5Location += "/";
            }

            this.openUI5Location += "sap-ui-core.js";

            cb();
        }.bind(this));
    };



    /**
     * Prompt to get the basic details for all apps.
     */
    Generator.prototype.promptForNamespaceConfirmation = function() {
        this.applicationNamespace = "";

        var cb = this.async();
        var extractedNamespace = openUI5Utils.getNamespace();

        var namespacePrompt = [{
            type: "confirm",
            name: "addNamespace",
            message: "Do you want to add it to the application namespace",
            default: true
        }, {
            when: function(response) {
                if (response.addNamespace === true) {
                    if (extractedNamespace.replace(" ", "") !== "") {
                        console.log(chalk.green("    Application namespace found: " + extractedNamespace));
                    } else {
                        console.log(chalk.yellow("    No Application Namespace found."));
                    }
                    return true;
                } else {
                    return false;
                }
            },
            name: "applicationNamespace",
            message: "Please confirm or change the namespace",
            default: extractedNamespace
        }];

        this.prompt(namespacePrompt, function(props) {
            this.addApplicationNamespaceToObject = props.addNamespace;



            if (props.applicationNamespace && props.applicationNamespace.replace(" ", "") !== "") {
                this.applicationNamespace = props.applicationNamespace + ".";
            } else {
                this.applicationNamespace = "";
            }

            cb();
        }.bind(this));
    };



    /**
     * Adds an element path to either the UI5 Bootstrap (Component Version) or as a local
     * resource (Application.js Version)
     *
     * @param {String} elementPath Path of the element to be checked
     */
    Generator.prototype.addResource = function(elementPath) {
        if (fs.existsSync("Component.js")) {
            this.addResourceRoot(elementPath);
        }
    };



    /**
     * Check if a sap.ui.localResources() entry exists for the first element of the
     * elemetPath in index.html. If not, it's added to index.html.
     *
     * @param {String} elementPath Path of the element to be checked
     */
    Generator.prototype.addLocalResource = function(elementPath) {
        var indexPath = path.join(process.cwd(), "index.html");
        var localResourcesString = "sap.ui.localResources( \"" + elementPath.split(".")[0] + "\" );";

        try {
            console.log(chalk.green("    check ") + "localResources register in index.html.");
            openUI5Utils.rewriteFile({
                file: "index.html",
                needle: "/* endOfResources */",
                splicable: [localResourcesString]
            });
        } catch (e) {
            console.log(chalk.red("\nUnable to find " + indexPath + ". ") + chalk.yellow(localResourcesString) + " could not be registered. Please check the resource register manaually.\n");
        }
    };



    /**
     * Check if a UI5 bootstrap resource root entry exists for the
     * first element of the elemetPath in index.html. If not, it's added to index.html.
     *
     * @param {String} elementPath Path of the element to be checked
     */
    Generator.prototype.addResourceRoot = function(elementPath) {
        var //indexPath = path.join(process.cwd(), "index.html"),
            resourcePath = elementPath.replace(/\./g, "/"),
            resourceRoot = "\"" + elementPath + "\": \"" + resourcePath + "\"";

        try {
            console.log(chalk.green("    check ") + "resource root registered in UI5 bootstrap in index.html.");
            openUI5Utils.rewriteFile({
                file: "index.html",
                needle: "/* endOfResourceroots */",
                splicable: [resourceRoot],
                extraIndents: 1
            });

            openUI5Utils.addCommaToLine({
                file: "index.html",
                needle: "/* endOfResourceroots */",
                offset: -2
            });
        } catch (e) {
            openUI5Utils.logResourceRootEditingError(e);
        }
    };


    /**
     * Check which library the index.html file is using.
     *
     * @return {String} Library "sap.m" or "sap.ui.commons".
     */
    Generator.prototype.whichLibrary = function() {
        return openUI5Utils.whichLibrary();
    };
}());