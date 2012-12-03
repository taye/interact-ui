.PHONY: all build clean

SRC_DIR = src
TOOLS_DIR = $(SRC_DIR)/tools
BUILD_DIR = build

INTERACT = $(SRC_DIR)/lib/interact.js
INTERACTMIN = $(BUILD_DIR)/interact.min.js

TOOLS = $(shell ls $(TOOLS_DIR))
TOOL_FILES = $(addprefix $(TOOLS_DIR)/, $(TOOLS))

SASS_DIR = $(SRC_DIR)/sass

TARGETJS = $(BUILD_DIR)/interact-ui.js
TARGETMINJS = $(BUILD_DIR)/interact-ui.min.js

TARGETCSS = $(BUILD_DIR)/interact-ui.css
TARGETMINCSS = $(BUILD_DIR)/interact-ui.min.css

COMPILER = java -jar utils/compiler/compiler.jar
SASS = $(shell which sass)

builtFiles = $(shell ls build)
ifneq (,$(builtFiles))
	clean = rm -r $(addprefix $(BUILD_DIR)/, $(builtFiles))
endif


all: build

build:
	cat $(SRC_DIR)/head.js $(SRC_DIR)/core.js > $(TARGETJS)
	cat $(TOOL_FILES) >> $(TARGETJS)
	cat $(SRC_DIR)/tail.js >> $(TARGETJS)
	
	mkdir -p $(BUILD_DIR)
	cp $(INTERACT) $(BUILD_DIR)
	
	$(SASS) --style expanded $(SASS_DIR)/interact-ui.scss:$(TARGETCSS)

compress:
	$(COMPILER) --js=$(TARGETJS) --js_output_file=$(TARGETMINJS)
	$(COMPILER) --js=$(INTERACT) --js_output_file=$(INTERACTMIN)
	$(SASS) --style compressed $(SASS_DIR)/interact-ui.scss:$(TARGETMINCSS)

clean:
	$(clean)

