.PHONY: all clean
all: dist/index.html

clean:
	rm -f dist

dist/index.html: src/*.elm
	mkdir -p dist
	elm-make $^ --output="$@"
