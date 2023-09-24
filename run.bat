node body-normalize.js fireyejs.js fireyejs.1.js
node void-unary-expression-unwrap.js fireyejs.1.js fireyejs.2.js
node assignment-hoist.js fireyejs.2.js fireyejs.3.js
node seq-expr-addassign-str-literals-fold.js fireyejs.3.js fireyejs.4.js
node seq-expr-assign-addassign-str-literals-fold.js fireyejs.4.js fireyejs.5.js
node seq-expr-assign-split_reverse_join-str-literals-fold.js fireyejs.5.js fireyejs.6.js

:: node control-flow-graph-deflat.js --line 98 fireyejs.6.js fireyejs.7.js

:: node seq-expr-to-statements.js fireyejs.7.js fireyejs.8.js
:: node void-unary-expression-to-undefined.js fireyejs.8.js fireyejs.9.js
