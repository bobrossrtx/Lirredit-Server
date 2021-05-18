NODEBUILD = npm run build
NODERUN = npm start
NODEDEV = npm run dev

SRCDIR = src
ALLSRC = $(wildcard *.ts)

DISTDIR = dist
ALLDIST = $(wildcard *.js)

all: clean node.modules node.build

node.modules: package.json
	npm install

node.build: $(SRCDIR)/$(ALLSRC)
	$(NODEBUILD)

clean:
	rm -rf node_modules
	rm -rf dist

run: $(DISTDIR)/$(ALLDIST)
	$(NODERUN)

dev: $(DISTDIR)/$(ALLDIST)
	$(NODEDEV)
