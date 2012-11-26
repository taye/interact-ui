.PHONY: all build clean

JS_DIR = js
BUILD_DIR = build


INTERACT = $(JS_DIR)/interact.js
INTERACTMIN = $(BUILD_DIR)/interact.min.js

TOOLS = Slider Toggle ColorPicker Float
TOOL_FILES = $(addprefix $(JS_DIR)/, $(addsuffix .js, $(TOOLS)))

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
	cat js/head.js js/core.js > $(TARGETJS)
	cat $(TOOL_FILES) >> $(TARGETJS)
	cat js/tail.js >> $(TARGETJS)
	
	cp $(INTERACT) $(BUILD_DIR)
	
	$(SASS) --style expanded sass/interact-ui.scss:$(TARGETCSS)

compress:
	$(COMPILER) --js=$(TARGETJS) --js_output_file=$(TARGETMINJS)
	$(COMPILER) --js=$(INTERACT) --js_output_file=$(INTERACTMIN)
	$(SASS) --style compressed sass/interact-ui.scss:$(TARGETMINCSS)

clean:
	$(clean)

