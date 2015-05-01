(function() {
    /* global __dirname, require, module */
    "use strict";
    var util = require("util");
    var path = require("path");
    var chalk = require("chalk");
    var ScriptBase = require("../script-base.js");

    /*jshint unused: vars */
    var ptdttui5Generator = module.exports = function ptdttui5Generator(args, options, config) {
        ScriptBase.apply(this, arguments);

        console.log("");
        console.log(chalk.bgBlue("Gerador de aplicações OpenUI5 DTT"));
        console.log("");

        this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, "../package.json")));
    };

    util.inherits(ptdttui5Generator, ScriptBase);

    /**
     * Generator prompts for configuration - basic prompts for all apps
     */
    ptdttui5Generator.prototype.askForBasics = function() {
        this.promptForBasicDetails();
    };

    /**
     * Generator prompts for configuration
     */
    ptdttui5Generator.prototype.askForApplication = function askFor() {
        var cb = this.async();

        var prompts = [{
                name: "applicationType",
                type: "list",
                message: "Que tipo de aplicação quer?",
                choices: [
                    {
                        name: "Aplicação de lista",
                        value: "lista"
                    },
                    {
                        name: "Aplicação master/detail",
                        value: "md"
                    }
                ]
            },
            {
                name: "fioriComponentNamespace",
                message: "Qual o namespace?",
                default: "sap.ui.demo"
            }
        ];

        this.prompt(prompts, function(props) {
            this.applicationType = props.applicationType;
            this.fioriComponentNamespace = props.fioriComponentNamespace + "." + this.applicationName;

            cb();
        }.bind(this));
    };

    ptdttui5Generator.prototype.askForODataParameters = function(){
        var cb = this.async();

        var prompts = [
            {
                name: "backendURL",
                message: "Qual o IP/URL do backend?",
                default: "192.168.1.1"
            },
            {
                name: "backendPorto",
                message: "Qual o porto do backend?",
                default: "8000"
            },
            {
                name: "oDataService",
                message: "Qual o serviço oData?"
            }
        ];

        this.prompt(prompts, function(props) {
            this.backendURL = props.backendURL;
            this.backendPorto = props.backendPorto;
            this.oDataService = props.oDataService;

            cb();
        }.bind(this));
    }

    ptdttui5Generator.prototype.askForUI5Location = function() {
        this.promptForUI5Location();
    };

    ptdttui5Generator.prototype.askForBuildOptions = function() {
        var cb = this.async();

        var prompts = [{
            name: "localServerPort",
            message: "Qual o port para o servidor local?",
            default: "8080"
        }];

        this.prompt(prompts, function(props) {
            this.localServerPort = props.localServerPort;

            cb();
        }.bind(this));
    };

    /**
     * Scaffolding of the common project files, which are needed for every project type
     *
     * @return {[type]} [description]
     */
    ptdttui5Generator.prototype.projectFiles = function projectfiles() {


        this.template("Gruntfile.js", "Gruntfile.js");
        //this.copy("jshintrc", ".jshintrc");
        this.template("_bower.json", "bower.json");
        this.template("_package.json", "package.json");
        this.template("_eslintrc", ".eslintrc");

        //this.template("_README.md", "README.md");
        this.copy("_gitignore", ".gitignore");
        //this.copy("editorconfig", ".editorconfig");
        //This is to ignore npm_modules/ if the app is loaded onto an ABAP system
        this.copy("_Ui5RepositoryIgnore", ".Ui5RepositoryIgnore");
    };

    /**
     * Scaffolding para o master details.
     */
    ptdttui5Generator.prototype.mdApplication = function() {
        if (this.applicationType !== "md") {
            return;
        }

        this.mkdir("css");
        this.copy("md/css/style.css", "css/style.css");

        this.mkdir("i18n");
        this.copy("md/i18n/messageBundle.properties", "i18n/messageBundle.properties");

        this.mkdir("model");

        //Not copying a test file at this stage - the sap provided one is wrong!
        //this.copy("tdg/tests/Navigation.qunit.html", "tests/Navigation.qunit.html");

        this.mkdir("util");
        this.template("md/util/_Controller.js", "util/Controller.js");
        this.template("md/util/_Formatter.js", "util/Formatter.js");

        this.mkdir("view");
        this.template("md/view/_App.view.xml", "view/App.view.xml");
        this.template("md/view/_NotFound.view.xml", "view/NotFound.view.xml");
        this.template("md/view/_Detail.view.xml", "view/Detail.view.xml");
        this.template("md/view/_Master.view.xml", "view/Master.view.xml");
        this.template("md/view/_Detail.controller.js", "view/Detail.controller.js");
        this.template("md/view/_Master.controller.js", "view/Master.controller.js");
        this.template("md/view/_Dialog.fragment.xml", "view/Dialog.fragment.xml");


        this.template("md/_index.html", "index.html");
        this.template("md/_Component.js", "Component.js");
        this.template("md/_MyRouter.js", "MyRouter.js");
    };

    ptdttui5Generator.prototype.listApplication = function() {
        if (this.applicationType !== "lista") {
            return;
        }

        this.mkdir("css");
        this.copy("lista/css/style.css", "css/style.css");

        this.mkdir("i18n");
        this.copy("lista/i18n/messageBundle.properties", "i18n/messageBundle.properties");

        this.mkdir("model");

        //this.mkdir("tests");
        //this.copy("gitkeep", "img/.gitkeep");
        //Not copying a test file at this stage - the sap provided one is wrong!
        //this.copy("tdg/tests/Navigation.qunit.html", "tests/Navigation.qunit.html");

        this.mkdir("util");
        this.template("lista/util/_Controller.js", "util/Controller.js");
        //this.template("md/util/_Formatter.js", "util/Formatter.js");

        this.mkdir("view");
        this.template("lista/view/_App.view.xml", "view/App.view.xml");
        this.template("lista/view/_List.view.xml", "view/List.view.xml");
        this.template("lista/view/_List.controller.js", "view/List.controller.js");
        this.template("lista/_index.html", "index.html");
        this.template("lista/_Component.js", "Component.js");
        this.template("lista/_MyRouter.js", "MyRouter.js");
    };

    ptdttui5Generator.prototype.install = function install() {
        // Install dependencies
        this.installDependencies();
        this.log(chalk.blue("\nBaseado em OpenUI5 Generator por: Jason Scott & Sascha Kiefer.\n"));
    };

}());
