all: index.js
	@echo "make run"
	@node index.js
	@echo "make run done"

test: test.js
	@echo "make test"
	@node test.js
	@echo "make test done"

