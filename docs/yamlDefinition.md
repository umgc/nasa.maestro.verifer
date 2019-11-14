NASA EVA Task Generator YAML Definition
=======================================

<span style="font-size: 20px;">THIS FILE IS PROBABLY VERY OUT OF DATE !!!</span>

Table of Contents
-----------------

[1 Overview](#overview)

[1.1 Purpose](#purpose)

[1.2 Scope](#scope)

[1.3 Goals and Objectives](#goals-and-objectives)

[1.5 Definitions](#definitions)

[2 JSON Schema Usage](#json-schema-usage)

[2.1 Manual Validation](#manual-validation)

[2.2 Programmatic Validation](#programmatic-validation)

[3 YAML File Usage](#yaml-file-usage)

[3.1 Procedure File Description](#procedure-file-description)

[3.1.1 JSON Schema](#json-schema)

[3.1.2 YAML Definitions](#yaml-definitions)

[3.2 Task File Description](#task-file-description)

[3.2.1 JSON Schema](#json-schema-1)

[3.2.2 YAML Definitions](#yaml-definitions-1)

[4 Formatting](#formatting)

[4.1 Markdown](#markdown)

[4.2 Unicode Characters](#unicode-characters)

[5 References](#references)

Overview
========

The purpose of the NASA EVA Task Generator project is to create a
software application to replace the manual process of creating
procedures for Extravehicular Activity (EVA), also known as spacewalks.
These procedures typically include two astronauts (known as EV1 and EV2)
working outside the space station, a robotics operator inside the space
station, and support from Mission Control on the ground. Care must be
taken when generating EVA tasks to deconflict parallel EVA activities.

Purpose
-------

This document outlines the schema definition for the YAML files that are
utilized as input into the NASA EVA Task Generator. This will provide a
reference for those implementing a YAML input file in order to ensure
that the data is input correctly.

Each file will have a JSON Schema which defines what valid YAML will
contain. This provides a reference that is both human and machine
readable, and can also be utilized to programmatically validate that the
YAML file is valid prior to attempting to parse it.

Scope
-----

The scope for this document is strictly the YAML files. This document
does not delve into the internal representation of the data once it is
parsed. The output format of the EVA Task Generator is only discussed
where there are direct implications of how the data is represented in
YAML to the final representation in the HTML output.

Goals and Objectives
--------------------

The primary goal of this document is to formally define the YAML input,
and thereby ensuring that newly generated YAML is correctly formatted in
order to be processed by the EVA Task Generator application.

Definitions
-----------

EVA -- Extravehicular Activity

NASA - National Aeronautics and Space Administration

HTML -- Hypertext Markup Language

JSON -- JavaScript Object Notation

SWEN 670 -- Software Engineering course number 670

UMUC -- University of Maryland University College

YAML -- YAML Ain\'t Markup Language

JSON Schema Usage
=================

According to JSON Schema Everywhere:

> "JSON Schema is a collaborative, specification-based effort to define
> schemas for JSON documents that has potential to become an Internet
> Standard. It has significant adoption and tooling support across
> implementation languages and environments.
>
> Users of similar technologies, such as YAML, have not yet achieved
> equivalent validation or tooling support. However, the strongly
> similar role of these technologies makes it possible to use the JSON
> Schema standard directly. Adopting JSON Schema avoids the need to
> develop a new standard and builds on existing developer mind-share."
> (Voss & Lucas, 2018)

As such, JSON Schema will be used to describe the YAML files that are
used as input for the EVA Task Generator.

JSON Schema is documented at <http://json-schema.org/> (Wright, et al.,
2019).

Manual Validation
-----------------

There are several tools that can be downloaded and run from the command
line that will validate YAML against JSON Schema. One such tool is
Polyglottal JSON Schema Validator (Poberezkin, et al., 2017). When the
tool is run, output is generated which either tells the user that the
YAML is valid, or it describes what portion of the YAML is invalid, and
why it is invalid. The tool can be used to validate the YAML
independently of running the EVA Task Generator.

Programmatic Validation
-----------------------

The YAML file can be validated programmatically prior to attempting to
parse it. This will ensure that the parsing does not fail, and that any
errors in the input file are identified prior to program execution.

YAML File Usage
===============

There are two different YAML file types that are used in this project,
the procedure file, and task files. Each task file represents a set of
potentially re-usable tasks that comprise a series of steps that are
rendered into an HTML table. The procedure file pulls together multiple
tasks into a single spacewalk procedure.

The YAML file that is passed into the EVA Task Generator is a Procedure
file, which contains references to one (or more) task files.

YAML is documented at <https://yaml.org/> (döt Net, et al., 2016).

Procedure File Description
--------------------------

The Procedure File represents all of the tasks that need to be completed
during an Extravehicular Activity (i.e. Spacewalk).

### JSON Schema

See [Procedure JSON Schema](../app/schema/procedureSchema.json) for the current JSON Schema definition.

### YAML Definitions

See docs for each schema below. These markdown files are automatically generated from the schema
files themselves.

- [procedureSchema.md](../app/schema/procedureSchema.md) (generated from [procedureSchema.json](../app/schema/procedureSchema.json))
- [taskSchema.md](../app/schema//taskSchema.md) (generated from [taskSchema.json](../app/schema/taskSchema.json))

Formatting
==========

There are several features that are included within the YAML files that
allow for specific formatting in the output of the HTML. These features
allow for easy writeup in YAML that will produce properly formatted final products (DOCX, HTML,
etc).

Documentation of formatting specifics needs to be automated.

References
==========

döt Net, I., Puzrin, V., flyx, Murphy, P. K., Tolnay, D., Ben-Kiki, O., . . . Zapparov, A. (2016, 12 19). *The Official YAML Web Site*. Retrieved 03 12, 2019, from The Official YAML Web Site: https://yaml.org/

Poberezkin, E., Voss, A., Collis, J., ehmicky, Fedorov, A., & Neculau, A. (2017, 08 18). *Polyglottal JSON Schema Validator*. Retrieved 03 12, 2019, from GitHub: https://github.com/json-schema-everywhere/pajv

Voss, A., & Lucas, T. (2018, 12 28). *JSON Schema Everywhere*. Retrieved 03 12, 2019, from JSON Schema Everywhere: https://json-schema-everywhere.github.io/

Wright, A., Laxalde, D., Poberezkin, E., Andrews, H., Berman, J., Viotti, J. C., . . . Hutton, B. (2019, 02 28). *The home of JSON Schema*. Retrieved 03 12, 2019, from JSON Schema: http://json-schema.org/
