
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.30.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function sineOut(t) {
        return Math.sin((t * Math.PI) / 2);
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }

    var _listCacheClear = listCacheClear;

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    var eq_1 = eq;

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq_1(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    var _assocIndexOf = assocIndexOf;

    /** Used for built-in method references. */
    var arrayProto = Array.prototype;

    /** Built-in value references. */
    var splice = arrayProto.splice;

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }

    var _listCacheDelete = listCacheDelete;

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    var _listCacheGet = listCacheGet;

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return _assocIndexOf(this.__data__, key) > -1;
    }

    var _listCacheHas = listCacheHas;

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = _assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    var _listCacheSet = listCacheSet;

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = _listCacheClear;
    ListCache.prototype['delete'] = _listCacheDelete;
    ListCache.prototype.get = _listCacheGet;
    ListCache.prototype.has = _listCacheHas;
    ListCache.prototype.set = _listCacheSet;

    var _ListCache = ListCache;

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new _ListCache;
      this.size = 0;
    }

    var _stackClear = stackClear;

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      var data = this.__data__,
          result = data['delete'](key);

      this.size = data.size;
      return result;
    }

    var _stackDelete = stackDelete;

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    var _stackGet = stackGet;

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    var _stackHas = stackHas;

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    var _freeGlobal = freeGlobal;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = _freeGlobal || freeSelf || Function('return this')();

    var _root = root;

    /** Built-in value references. */
    var Symbol$1 = _root.Symbol;

    var _Symbol = Symbol$1;

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /** Built-in value references. */
    var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }

    var _getRawTag = getRawTag;

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString$1 = objectProto$1.toString;

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString$1.call(value);
    }

    var _objectToString = objectToString;

    /** `Object#toString` result references. */
    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

    /** Built-in value references. */
    var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag$1 && symToStringTag$1 in Object(value))
        ? _getRawTag(value)
        : _objectToString(value);
    }

    var _baseGetTag = baseGetTag;

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    var isObject_1 = isObject;

    /** `Object#toString` result references. */
    var asyncTag = '[object AsyncFunction]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        proxyTag = '[object Proxy]';

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      if (!isObject_1(value)) {
        return false;
      }
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.
      var tag = _baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }

    var isFunction_1 = isFunction;

    /** Used to detect overreaching core-js shims. */
    var coreJsData = _root['__core-js_shared__'];

    var _coreJsData = coreJsData;

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    var _isMasked = isMasked;

    /** Used for built-in method references. */
    var funcProto = Function.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to convert.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    var _toSource = toSource;

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used for built-in method references. */
    var funcProto$1 = Function.prototype,
        objectProto$2 = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString$1 = funcProto$1.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject_1(value) || _isMasked(value)) {
        return false;
      }
      var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
      return pattern.test(_toSource(value));
    }

    var _baseIsNative = baseIsNative;

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    var _getValue = getValue;

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = _getValue(object, key);
      return _baseIsNative(value) ? value : undefined;
    }

    var _getNative = getNative;

    /* Built-in method references that are verified to be native. */
    var Map$1 = _getNative(_root, 'Map');

    var _Map = Map$1;

    /* Built-in method references that are verified to be native. */
    var nativeCreate = _getNative(Object, 'create');

    var _nativeCreate = nativeCreate;

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
      this.size = 0;
    }

    var _hashClear = hashClear;

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }

    var _hashDelete = hashDelete;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used for built-in method references. */
    var objectProto$3 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (_nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
    }

    var _hashGet = hashGet;

    /** Used for built-in method references. */
    var objectProto$4 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return _nativeCreate ? (data[key] !== undefined) : hasOwnProperty$3.call(data, key);
    }

    var _hashHas = hashHas;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = (_nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
      return this;
    }

    var _hashSet = hashSet;

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = _hashClear;
    Hash.prototype['delete'] = _hashDelete;
    Hash.prototype.get = _hashGet;
    Hash.prototype.has = _hashHas;
    Hash.prototype.set = _hashSet;

    var _Hash = Hash;

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new _Hash,
        'map': new (_Map || _ListCache),
        'string': new _Hash
      };
    }

    var _mapCacheClear = mapCacheClear;

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    var _isKeyable = isKeyable;

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return _isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    var _getMapData = getMapData;

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      var result = _getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
    }

    var _mapCacheDelete = mapCacheDelete;

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return _getMapData(this, key).get(key);
    }

    var _mapCacheGet = mapCacheGet;

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return _getMapData(this, key).has(key);
    }

    var _mapCacheHas = mapCacheHas;

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      var data = _getMapData(this, key),
          size = data.size;

      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }

    var _mapCacheSet = mapCacheSet;

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = _mapCacheClear;
    MapCache.prototype['delete'] = _mapCacheDelete;
    MapCache.prototype.get = _mapCacheGet;
    MapCache.prototype.has = _mapCacheHas;
    MapCache.prototype.set = _mapCacheSet;

    var _MapCache = MapCache;

    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof _ListCache) {
        var pairs = data.__data__;
        if (!_Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new _MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }

    var _stackSet = stackSet;

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      var data = this.__data__ = new _ListCache(entries);
      this.size = data.size;
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = _stackClear;
    Stack.prototype['delete'] = _stackDelete;
    Stack.prototype.get = _stackGet;
    Stack.prototype.has = _stackHas;
    Stack.prototype.set = _stackSet;

    var _Stack = Stack;

    /**
     * A specialized version of `_.forEach` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEach(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }

    var _arrayEach = arrayEach;

    var defineProperty = (function() {
      try {
        var func = _getNative(Object, 'defineProperty');
        func({}, '', {});
        return func;
      } catch (e) {}
    }());

    var _defineProperty = defineProperty;

    /**
     * The base implementation of `assignValue` and `assignMergeValue` without
     * value checks.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function baseAssignValue(object, key, value) {
      if (key == '__proto__' && _defineProperty) {
        _defineProperty(object, key, {
          'configurable': true,
          'enumerable': true,
          'value': value,
          'writable': true
        });
      } else {
        object[key] = value;
      }
    }

    var _baseAssignValue = baseAssignValue;

    /** Used for built-in method references. */
    var objectProto$5 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

    /**
     * Assigns `value` to `key` of `object` if the existing value is not equivalent
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty$4.call(object, key) && eq_1(objValue, value)) ||
          (value === undefined && !(key in object))) {
        _baseAssignValue(object, key, value);
      }
    }

    var _assignValue = assignValue;

    /**
     * Copies properties of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy properties from.
     * @param {Array} props The property identifiers to copy.
     * @param {Object} [object={}] The object to copy properties to.
     * @param {Function} [customizer] The function to customize copied values.
     * @returns {Object} Returns `object`.
     */
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});

      var index = -1,
          length = props.length;

      while (++index < length) {
        var key = props[index];

        var newValue = customizer
          ? customizer(object[key], source[key], key, object, source)
          : undefined;

        if (newValue === undefined) {
          newValue = source[key];
        }
        if (isNew) {
          _baseAssignValue(object, key, newValue);
        } else {
          _assignValue(object, key, newValue);
        }
      }
      return object;
    }

    var _copyObject = copyObject;

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    var _baseTimes = baseTimes;

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    var isObjectLike_1 = isObjectLike;

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]';

    /**
     * The base implementation of `_.isArguments`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     */
    function baseIsArguments(value) {
      return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
    }

    var _baseIsArguments = baseIsArguments;

    /** Used for built-in method references. */
    var objectProto$6 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$5 = objectProto$6.hasOwnProperty;

    /** Built-in value references. */
    var propertyIsEnumerable = objectProto$6.propertyIsEnumerable;

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    var isArguments = _baseIsArguments(function() { return arguments; }()) ? _baseIsArguments : function(value) {
      return isObjectLike_1(value) && hasOwnProperty$5.call(value, 'callee') &&
        !propertyIsEnumerable.call(value, 'callee');
    };

    var isArguments_1 = isArguments;

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    var isArray_1 = isArray;

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    var stubFalse_1 = stubFalse;

    var isBuffer_1 = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports =  exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Built-in value references. */
    var Buffer = moduleExports ? _root.Buffer : undefined;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse_1;

    module.exports = isBuffer;
    });

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;

      return !!length &&
        (type == 'number' ||
          (type != 'symbol' && reIsUint.test(value))) &&
            (value > -1 && value % 1 == 0 && value < length);
    }

    var _isIndex = isIndex;

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER$1 = 9007199254740991;

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
    }

    var isLength_1 = isLength;

    /** `Object#toString` result references. */
    var argsTag$1 = '[object Arguments]',
        arrayTag = '[object Array]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        funcTag$1 = '[object Function]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        objectTag = '[object Object]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        weakMapTag = '[object WeakMap]';

    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

    /** Used to identify `toStringTag` values of typed arrays. */
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
    typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
    typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
    typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
    typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
    typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
    typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
    typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
    typedArrayTags[mapTag] = typedArrayTags[numberTag] =
    typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
    typedArrayTags[setTag] = typedArrayTags[stringTag] =
    typedArrayTags[weakMapTag] = false;

    /**
     * The base implementation of `_.isTypedArray` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     */
    function baseIsTypedArray(value) {
      return isObjectLike_1(value) &&
        isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
    }

    var _baseIsTypedArray = baseIsTypedArray;

    /**
     * The base implementation of `_.unary` without support for storing metadata.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     */
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }

    var _baseUnary = baseUnary;

    var _nodeUtil = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports =  exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Detect free variable `process` from Node.js. */
    var freeProcess = moduleExports && _freeGlobal.process;

    /** Used to access faster Node.js helpers. */
    var nodeUtil = (function() {
      try {
        // Use `util.types` for Node.js 10+.
        var types = freeModule && freeModule.require && freeModule.require('util').types;

        if (types) {
          return types;
        }

        // Legacy `process.binding('util')` for Node.js < 10.
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }());

    module.exports = nodeUtil;
    });

    /* Node.js helper references. */
    var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;

    var isTypedArray_1 = isTypedArray;

    /** Used for built-in method references. */
    var objectProto$7 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$6 = objectProto$7.hasOwnProperty;

    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray_1(value),
          isArg = !isArr && isArguments_1(value),
          isBuff = !isArr && !isArg && isBuffer_1(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? _baseTimes(value.length, String) : [],
          length = result.length;

      for (var key in value) {
        if ((inherited || hasOwnProperty$6.call(value, key)) &&
            !(skipIndexes && (
               // Safari 9 has enumerable `arguments.length` in strict mode.
               key == 'length' ||
               // Node.js 0.10 has enumerable non-index properties on buffers.
               (isBuff && (key == 'offset' || key == 'parent')) ||
               // PhantomJS 2 has enumerable non-index properties on typed arrays.
               (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
               // Skip index properties.
               _isIndex(key, length)
            ))) {
          result.push(key);
        }
      }
      return result;
    }

    var _arrayLikeKeys = arrayLikeKeys;

    /** Used for built-in method references. */
    var objectProto$8 = Object.prototype;

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$8;

      return value === proto;
    }

    var _isPrototype = isPrototype;

    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }

    var _overArg = overArg;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeKeys = _overArg(Object.keys, Object);

    var _nativeKeys = nativeKeys;

    /** Used for built-in method references. */
    var objectProto$9 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

    /**
     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      if (!_isPrototype(object)) {
        return _nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty$7.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }
      return result;
    }

    var _baseKeys = baseKeys;

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength_1(value.length) && !isFunction_1(value);
    }

    var isArrayLike_1 = isArrayLike;

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    function keys(object) {
      return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
    }

    var keys_1 = keys;

    /**
     * The base implementation of `_.assign` without support for multiple sources
     * or `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    function baseAssign(object, source) {
      return object && _copyObject(source, keys_1(source), object);
    }

    var _baseAssign = baseAssign;

    /**
     * This function is like
     * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * except that it includes inherited enumerable properties.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }

    var _nativeKeysIn = nativeKeysIn;

    /** Used for built-in method references. */
    var objectProto$a = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$8 = objectProto$a.hasOwnProperty;

    /**
     * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeysIn(object) {
      if (!isObject_1(object)) {
        return _nativeKeysIn(object);
      }
      var isProto = _isPrototype(object),
          result = [];

      for (var key in object) {
        if (!(key == 'constructor' && (isProto || !hasOwnProperty$8.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }

    var _baseKeysIn = baseKeysIn;

    /**
     * Creates an array of the own and inherited enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keysIn(new Foo);
     * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
     */
    function keysIn(object) {
      return isArrayLike_1(object) ? _arrayLikeKeys(object, true) : _baseKeysIn(object);
    }

    var keysIn_1 = keysIn;

    /**
     * The base implementation of `_.assignIn` without support for multiple sources
     * or `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    function baseAssignIn(object, source) {
      return object && _copyObject(source, keysIn_1(source), object);
    }

    var _baseAssignIn = baseAssignIn;

    var _cloneBuffer = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports =  exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Built-in value references. */
    var Buffer = moduleExports ? _root.Buffer : undefined,
        allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

    /**
     * Creates a clone of  `buffer`.
     *
     * @private
     * @param {Buffer} buffer The buffer to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Buffer} Returns the cloned buffer.
     */
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length,
          result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

      buffer.copy(result);
      return result;
    }

    module.exports = cloneBuffer;
    });

    /**
     * Copies the values of `source` to `array`.
     *
     * @private
     * @param {Array} source The array to copy values from.
     * @param {Array} [array=[]] The array to copy values to.
     * @returns {Array} Returns `array`.
     */
    function copyArray(source, array) {
      var index = -1,
          length = source.length;

      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }

    var _copyArray = copyArray;

    /**
     * A specialized version of `_.filter` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function arrayFilter(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }

    var _arrayFilter = arrayFilter;

    /**
     * This method returns a new empty array.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Array} Returns the new empty array.
     * @example
     *
     * var arrays = _.times(2, _.stubArray);
     *
     * console.log(arrays);
     * // => [[], []]
     *
     * console.log(arrays[0] === arrays[1]);
     * // => false
     */
    function stubArray() {
      return [];
    }

    var stubArray_1 = stubArray;

    /** Used for built-in method references. */
    var objectProto$b = Object.prototype;

    /** Built-in value references. */
    var propertyIsEnumerable$1 = objectProto$b.propertyIsEnumerable;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols = Object.getOwnPropertySymbols;

    /**
     * Creates an array of the own enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbols = !nativeGetSymbols ? stubArray_1 : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return _arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable$1.call(object, symbol);
      });
    };

    var _getSymbols = getSymbols;

    /**
     * Copies own symbols of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy symbols from.
     * @param {Object} [object={}] The object to copy symbols to.
     * @returns {Object} Returns `object`.
     */
    function copySymbols(source, object) {
      return _copyObject(source, _getSymbols(source), object);
    }

    var _copySymbols = copySymbols;

    /**
     * Appends the elements of `values` to `array`.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to append.
     * @returns {Array} Returns `array`.
     */
    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }

    var _arrayPush = arrayPush;

    /** Built-in value references. */
    var getPrototype = _overArg(Object.getPrototypeOf, Object);

    var _getPrototype = getPrototype;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

    /**
     * Creates an array of the own and inherited enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbolsIn = !nativeGetSymbols$1 ? stubArray_1 : function(object) {
      var result = [];
      while (object) {
        _arrayPush(result, _getSymbols(object));
        object = _getPrototype(object);
      }
      return result;
    };

    var _getSymbolsIn = getSymbolsIn;

    /**
     * Copies own and inherited symbols of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy symbols from.
     * @param {Object} [object={}] The object to copy symbols to.
     * @returns {Object} Returns `object`.
     */
    function copySymbolsIn(source, object) {
      return _copyObject(source, _getSymbolsIn(source), object);
    }

    var _copySymbolsIn = copySymbolsIn;

    /**
     * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
     * `keysFunc` and `symbolsFunc` to get the enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @param {Function} symbolsFunc The function to get the symbols of `object`.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
    }

    var _baseGetAllKeys = baseGetAllKeys;

    /**
     * Creates an array of own enumerable property names and symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeys(object) {
      return _baseGetAllKeys(object, keys_1, _getSymbols);
    }

    var _getAllKeys = getAllKeys;

    /**
     * Creates an array of own and inherited enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeysIn(object) {
      return _baseGetAllKeys(object, keysIn_1, _getSymbolsIn);
    }

    var _getAllKeysIn = getAllKeysIn;

    /* Built-in method references that are verified to be native. */
    var DataView = _getNative(_root, 'DataView');

    var _DataView = DataView;

    /* Built-in method references that are verified to be native. */
    var Promise$1 = _getNative(_root, 'Promise');

    var _Promise = Promise$1;

    /* Built-in method references that are verified to be native. */
    var Set$1 = _getNative(_root, 'Set');

    var _Set = Set$1;

    /* Built-in method references that are verified to be native. */
    var WeakMap$1 = _getNative(_root, 'WeakMap');

    var _WeakMap = WeakMap$1;

    /** `Object#toString` result references. */
    var mapTag$1 = '[object Map]',
        objectTag$1 = '[object Object]',
        promiseTag = '[object Promise]',
        setTag$1 = '[object Set]',
        weakMapTag$1 = '[object WeakMap]';

    var dataViewTag$1 = '[object DataView]';

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = _toSource(_DataView),
        mapCtorString = _toSource(_Map),
        promiseCtorString = _toSource(_Promise),
        setCtorString = _toSource(_Set),
        weakMapCtorString = _toSource(_WeakMap);

    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    var getTag = _baseGetTag;

    // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
    if ((_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$1) ||
        (_Map && getTag(new _Map) != mapTag$1) ||
        (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
        (_Set && getTag(new _Set) != setTag$1) ||
        (_WeakMap && getTag(new _WeakMap) != weakMapTag$1)) {
      getTag = function(value) {
        var result = _baseGetTag(value),
            Ctor = result == objectTag$1 ? value.constructor : undefined,
            ctorString = Ctor ? _toSource(Ctor) : '';

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString: return dataViewTag$1;
            case mapCtorString: return mapTag$1;
            case promiseCtorString: return promiseTag;
            case setCtorString: return setTag$1;
            case weakMapCtorString: return weakMapTag$1;
          }
        }
        return result;
      };
    }

    var _getTag = getTag;

    /** Used for built-in method references. */
    var objectProto$c = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$9 = objectProto$c.hasOwnProperty;

    /**
     * Initializes an array clone.
     *
     * @private
     * @param {Array} array The array to clone.
     * @returns {Array} Returns the initialized clone.
     */
    function initCloneArray(array) {
      var length = array.length,
          result = new array.constructor(length);

      // Add properties assigned by `RegExp#exec`.
      if (length && typeof array[0] == 'string' && hasOwnProperty$9.call(array, 'index')) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }

    var _initCloneArray = initCloneArray;

    /** Built-in value references. */
    var Uint8Array = _root.Uint8Array;

    var _Uint8Array = Uint8Array;

    /**
     * Creates a clone of `arrayBuffer`.
     *
     * @private
     * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
     * @returns {ArrayBuffer} Returns the cloned array buffer.
     */
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new _Uint8Array(result).set(new _Uint8Array(arrayBuffer));
      return result;
    }

    var _cloneArrayBuffer = cloneArrayBuffer;

    /**
     * Creates a clone of `dataView`.
     *
     * @private
     * @param {Object} dataView The data view to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned data view.
     */
    function cloneDataView(dataView, isDeep) {
      var buffer = isDeep ? _cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }

    var _cloneDataView = cloneDataView;

    /** Used to match `RegExp` flags from their coerced string values. */
    var reFlags = /\w*$/;

    /**
     * Creates a clone of `regexp`.
     *
     * @private
     * @param {Object} regexp The regexp to clone.
     * @returns {Object} Returns the cloned regexp.
     */
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }

    var _cloneRegExp = cloneRegExp;

    /** Used to convert symbols to primitives and strings. */
    var symbolProto = _Symbol ? _Symbol.prototype : undefined,
        symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

    /**
     * Creates a clone of the `symbol` object.
     *
     * @private
     * @param {Object} symbol The symbol object to clone.
     * @returns {Object} Returns the cloned symbol object.
     */
    function cloneSymbol(symbol) {
      return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
    }

    var _cloneSymbol = cloneSymbol;

    /**
     * Creates a clone of `typedArray`.
     *
     * @private
     * @param {Object} typedArray The typed array to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned typed array.
     */
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? _cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }

    var _cloneTypedArray = cloneTypedArray;

    /** `Object#toString` result references. */
    var boolTag$1 = '[object Boolean]',
        dateTag$1 = '[object Date]',
        mapTag$2 = '[object Map]',
        numberTag$1 = '[object Number]',
        regexpTag$1 = '[object RegExp]',
        setTag$2 = '[object Set]',
        stringTag$1 = '[object String]',
        symbolTag = '[object Symbol]';

    var arrayBufferTag$1 = '[object ArrayBuffer]',
        dataViewTag$2 = '[object DataView]',
        float32Tag$1 = '[object Float32Array]',
        float64Tag$1 = '[object Float64Array]',
        int8Tag$1 = '[object Int8Array]',
        int16Tag$1 = '[object Int16Array]',
        int32Tag$1 = '[object Int32Array]',
        uint8Tag$1 = '[object Uint8Array]',
        uint8ClampedTag$1 = '[object Uint8ClampedArray]',
        uint16Tag$1 = '[object Uint16Array]',
        uint32Tag$1 = '[object Uint32Array]';

    /**
     * Initializes an object clone based on its `toStringTag`.
     *
     * **Note:** This function only supports cloning values with tags of
     * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
     *
     * @private
     * @param {Object} object The object to clone.
     * @param {string} tag The `toStringTag` of the object to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneByTag(object, tag, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag$1:
          return _cloneArrayBuffer(object);

        case boolTag$1:
        case dateTag$1:
          return new Ctor(+object);

        case dataViewTag$2:
          return _cloneDataView(object, isDeep);

        case float32Tag$1: case float64Tag$1:
        case int8Tag$1: case int16Tag$1: case int32Tag$1:
        case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
          return _cloneTypedArray(object, isDeep);

        case mapTag$2:
          return new Ctor;

        case numberTag$1:
        case stringTag$1:
          return new Ctor(object);

        case regexpTag$1:
          return _cloneRegExp(object);

        case setTag$2:
          return new Ctor;

        case symbolTag:
          return _cloneSymbol(object);
      }
    }

    var _initCloneByTag = initCloneByTag;

    /** Built-in value references. */
    var objectCreate = Object.create;

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} proto The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    var baseCreate = (function() {
      function object() {}
      return function(proto) {
        if (!isObject_1(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object;
        object.prototype = undefined;
        return result;
      };
    }());

    var _baseCreate = baseCreate;

    /**
     * Initializes an object clone.
     *
     * @private
     * @param {Object} object The object to clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneObject(object) {
      return (typeof object.constructor == 'function' && !_isPrototype(object))
        ? _baseCreate(_getPrototype(object))
        : {};
    }

    var _initCloneObject = initCloneObject;

    /** `Object#toString` result references. */
    var mapTag$3 = '[object Map]';

    /**
     * The base implementation of `_.isMap` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
     */
    function baseIsMap(value) {
      return isObjectLike_1(value) && _getTag(value) == mapTag$3;
    }

    var _baseIsMap = baseIsMap;

    /* Node.js helper references. */
    var nodeIsMap = _nodeUtil && _nodeUtil.isMap;

    /**
     * Checks if `value` is classified as a `Map` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
     * @example
     *
     * _.isMap(new Map);
     * // => true
     *
     * _.isMap(new WeakMap);
     * // => false
     */
    var isMap = nodeIsMap ? _baseUnary(nodeIsMap) : _baseIsMap;

    var isMap_1 = isMap;

    /** `Object#toString` result references. */
    var setTag$3 = '[object Set]';

    /**
     * The base implementation of `_.isSet` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
     */
    function baseIsSet(value) {
      return isObjectLike_1(value) && _getTag(value) == setTag$3;
    }

    var _baseIsSet = baseIsSet;

    /* Node.js helper references. */
    var nodeIsSet = _nodeUtil && _nodeUtil.isSet;

    /**
     * Checks if `value` is classified as a `Set` object.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
     * @example
     *
     * _.isSet(new Set);
     * // => true
     *
     * _.isSet(new WeakSet);
     * // => false
     */
    var isSet = nodeIsSet ? _baseUnary(nodeIsSet) : _baseIsSet;

    var isSet_1 = isSet;

    /** Used to compose bitmasks for cloning. */
    var CLONE_DEEP_FLAG = 1,
        CLONE_FLAT_FLAG = 2,
        CLONE_SYMBOLS_FLAG = 4;

    /** `Object#toString` result references. */
    var argsTag$2 = '[object Arguments]',
        arrayTag$1 = '[object Array]',
        boolTag$2 = '[object Boolean]',
        dateTag$2 = '[object Date]',
        errorTag$1 = '[object Error]',
        funcTag$2 = '[object Function]',
        genTag$1 = '[object GeneratorFunction]',
        mapTag$4 = '[object Map]',
        numberTag$2 = '[object Number]',
        objectTag$2 = '[object Object]',
        regexpTag$2 = '[object RegExp]',
        setTag$4 = '[object Set]',
        stringTag$2 = '[object String]',
        symbolTag$1 = '[object Symbol]',
        weakMapTag$2 = '[object WeakMap]';

    var arrayBufferTag$2 = '[object ArrayBuffer]',
        dataViewTag$3 = '[object DataView]',
        float32Tag$2 = '[object Float32Array]',
        float64Tag$2 = '[object Float64Array]',
        int8Tag$2 = '[object Int8Array]',
        int16Tag$2 = '[object Int16Array]',
        int32Tag$2 = '[object Int32Array]',
        uint8Tag$2 = '[object Uint8Array]',
        uint8ClampedTag$2 = '[object Uint8ClampedArray]',
        uint16Tag$2 = '[object Uint16Array]',
        uint32Tag$2 = '[object Uint32Array]';

    /** Used to identify `toStringTag` values supported by `_.clone`. */
    var cloneableTags = {};
    cloneableTags[argsTag$2] = cloneableTags[arrayTag$1] =
    cloneableTags[arrayBufferTag$2] = cloneableTags[dataViewTag$3] =
    cloneableTags[boolTag$2] = cloneableTags[dateTag$2] =
    cloneableTags[float32Tag$2] = cloneableTags[float64Tag$2] =
    cloneableTags[int8Tag$2] = cloneableTags[int16Tag$2] =
    cloneableTags[int32Tag$2] = cloneableTags[mapTag$4] =
    cloneableTags[numberTag$2] = cloneableTags[objectTag$2] =
    cloneableTags[regexpTag$2] = cloneableTags[setTag$4] =
    cloneableTags[stringTag$2] = cloneableTags[symbolTag$1] =
    cloneableTags[uint8Tag$2] = cloneableTags[uint8ClampedTag$2] =
    cloneableTags[uint16Tag$2] = cloneableTags[uint32Tag$2] = true;
    cloneableTags[errorTag$1] = cloneableTags[funcTag$2] =
    cloneableTags[weakMapTag$2] = false;

    /**
     * The base implementation of `_.clone` and `_.cloneDeep` which tracks
     * traversed objects.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} bitmask The bitmask flags.
     *  1 - Deep clone
     *  2 - Flatten inherited properties
     *  4 - Clone symbols
     * @param {Function} [customizer] The function to customize cloning.
     * @param {string} [key] The key of `value`.
     * @param {Object} [object] The parent object of `value`.
     * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, bitmask, customizer, key, object, stack) {
      var result,
          isDeep = bitmask & CLONE_DEEP_FLAG,
          isFlat = bitmask & CLONE_FLAT_FLAG,
          isFull = bitmask & CLONE_SYMBOLS_FLAG;

      if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
      }
      if (result !== undefined) {
        return result;
      }
      if (!isObject_1(value)) {
        return value;
      }
      var isArr = isArray_1(value);
      if (isArr) {
        result = _initCloneArray(value);
        if (!isDeep) {
          return _copyArray(value, result);
        }
      } else {
        var tag = _getTag(value),
            isFunc = tag == funcTag$2 || tag == genTag$1;

        if (isBuffer_1(value)) {
          return _cloneBuffer(value, isDeep);
        }
        if (tag == objectTag$2 || tag == argsTag$2 || (isFunc && !object)) {
          result = (isFlat || isFunc) ? {} : _initCloneObject(value);
          if (!isDeep) {
            return isFlat
              ? _copySymbolsIn(value, _baseAssignIn(result, value))
              : _copySymbols(value, _baseAssign(result, value));
          }
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = _initCloneByTag(value, tag, isDeep);
        }
      }
      // Check for circular references and return its corresponding clone.
      stack || (stack = new _Stack);
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);

      if (isSet_1(value)) {
        value.forEach(function(subValue) {
          result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
        });
      } else if (isMap_1(value)) {
        value.forEach(function(subValue, key) {
          result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
        });
      }

      var keysFunc = isFull
        ? (isFlat ? _getAllKeysIn : _getAllKeys)
        : (isFlat ? keysIn_1 : keys_1);

      var props = isArr ? undefined : keysFunc(value);
      _arrayEach(props || value, function(subValue, key) {
        if (props) {
          key = subValue;
          subValue = value[key];
        }
        // Recursively populate clone (susceptible to call stack limits).
        _assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
      });
      return result;
    }

    var _baseClone = baseClone;

    /** Used to compose bitmasks for cloning. */
    var CLONE_DEEP_FLAG$1 = 1,
        CLONE_SYMBOLS_FLAG$1 = 4;

    /**
     * This method is like `_.clone` except that it recursively clones `value`.
     *
     * @static
     * @memberOf _
     * @since 1.0.0
     * @category Lang
     * @param {*} value The value to recursively clone.
     * @returns {*} Returns the deep cloned value.
     * @see _.clone
     * @example
     *
     * var objects = [{ 'a': 1 }, { 'b': 2 }];
     *
     * var deep = _.cloneDeep(objects);
     * console.log(deep[0] === objects[0]);
     * // => false
     */
    function cloneDeep(value) {
      return _baseClone(value, CLONE_DEEP_FLAG$1 | CLONE_SYMBOLS_FLAG$1);
    }

    var cloneDeep_1 = cloneDeep;

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const createGalleryStore = () => {
        const { subscribe, set, update } = writable ({
            title: 'ALBUM',
            images: []
        });

        let GALLERY;
        subscribe(gallery => GALLERY = gallery);

        const updateImages = imageBatch => {
            const updated = cloneDeep_1(GALLERY);
            updated.images = imageBatch;
            set(updated);
        };

        const getAllImages = () => cloneDeep_1(GALLERY.images);

        const loadFullJSON = async () => {
            var handleError = function (err) {
                console.error('Fetch error', err);
                return new window.Response(JSON.stringify({
                    code: 400,
                    message: 'FETCH ERROR'
                }));
            };

            const req = await (fetch('album-meta-full.json').catch(handleError));

            if (req.status === 200) {
                const fullData = await req.json();

                const updates = fullData.images
                    .filter(image => image.dataURI && image.dataURI !== 'noData');

                const allImages = getAllImages();

                for (const source of updates) {
                    const target = allImages.find(next => next.fileName === source.fileName);
                    if(target) {
                        target.dataURI = source.dataURI;
                    }
                }

               updateImages(allImages);
            } else {
                console.log('album-meta-full.json NOT LOADED', req);
            }

        };

        const viewLightbox = fileName => {
            const updated = cloneDeep_1(GALLERY);
            updated.current = fileName;
            updated.active = true;

            console.log('STORE', updated);

            set(updated);
        };

        const closeLightbox = () => {
            const updated = cloneDeep_1(GALLERY);
            updated.active = false;
            set(updated);
        };

        return {
            updateImages,
            getAllImages,
            loadFullJSON,

            viewLightbox,
            closeLightbox,

            subscribe,
            set,
            update
        };
    };

    const GalleryStore = createGalleryStore();

    const replaceLastOrAdd = (input, find, replaceWith) => {
        if (!input || !find || !input.length || !find.length) {
            return input;
        }

        const lastIndex = input.lastIndexOf(find);
        if (lastIndex < 0) {
            return input + (replaceWith ? replaceWith : '');
        }

        return input.substr(0, lastIndex) + 
            replaceWith + 
            input.substr(lastIndex + find.length);
    };

    const getSizedPath = (size, fileName) => size === 'original' 
        ? '__original/' + fileName
        : size + '/' + replaceLastOrAdd(fileName, '.jpg', '--' + size + '.jpg');

    // import Cookies from 'lib/cookies-js';

    // =========== RESIZE END EVENT ===============================
    (function() {
        var EVENT_KEY = 'resizeend',
            TIMEOUT = 200;
        var timer;

        function callResizeEnd() {
            var event = new window.CustomEvent(EVENT_KEY);
            window.dispatchEvent(event);
        }

        window.addEventListener('resize', () => {
            clearTimeout(timer);
            timer = setTimeout(callResizeEnd, TIMEOUT);
        });
    })();


    // =========== EXPOSE DOCUMENT WIDTH TO THE APP =================
    let docWidth = 0;
    const getDocWidth = () => docWidth;
    let docHeight = 0;
    const getDocHeight = () => docHeight;

    const refreshDocDimensions = () => {
        const w = window;
        const d = document;
        const e = d.documentElement;
        const g = d.getElementsByTagName('body')[0];
        docWidth = w.innerWidth || e.clientWidth || g.clientWidth;
        docHeight = w.innerHeight || e.clientHeight || g.clientHeight;
    };
    window.addEventListener('resizeend', refreshDocDimensions);
    refreshDocDimensions();

    const dummyImage = {
        dataURI: ' data:image/jpeg;base64,/9j/4QAqRXhpZgAASUkqAAgAAAABAJiCAgAFAAAAGgAAAAAAAABLdW1lAAAAAP/sABFEdWNreQABAAQAAAAeAAD/4QSZaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA2LjAtYzAwMiA3OS4xNjQzNTIsIDIwMjAvMDEvMzAtMTU6NTA6MzggICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcFJpZ2h0cz0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3JpZ2h0cy8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcFJpZ2h0czpXZWJTdGF0ZW1lbnQ9Imh0dHBzOi8vd3d3LmdldHR5aW1hZ2VzLmNvbS9ldWxhP3V0bV9tZWRpdW09b3JnYW5pYyZhbXA7dXRtX3NvdXJjZT1nb29nbGUmYW1wO3V0bV9jYW1wYWlnbj1pcHRjdXJsIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkUwN0Y1MDRBMzZFNTExRUI5NkMwRjJCMzI5OTgzNEJBIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkUwN0Y1MDQ5MzZFNTExRUI5NkMwRjJCMzI5OTgzNEJBIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyMDIwIFdpbmRvd3MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0iREE3MDYyN0U3OTgwODYwQUJCNkM1QTYwRjBERDI0OTUiIHN0UmVmOmRvY3VtZW50SUQ9IkRBNzA2MjdFNzk4MDg2MEFCQjZDNUE2MEYwREQyNDk1Ii8+IDxkYzpyaWdodHM+IDxyZGY6QWx0PiA8cmRmOmxpIHhtbDpsYW5nPSJ4LWRlZmF1bHQiPkt1bWVyPC9yZGY6bGk+IDwvcmRmOkFsdD4gPC9kYzpyaWdodHM+IDxkYzpjcmVhdG9yPiA8cmRmOlNlcT4gPHJkZjpsaT5LdW1lcjwvcmRmOmxpPiA8L3JkZjpTZXE+IDwvZGM6Y3JlYXRvcj4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7/7QBSUGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAABkcAVoAAxslRxwCAAACAAIcAnQABUt1bWVyADhCSU0EJQAAAAAAEM8ZAu5strHKPBzBtSJ29g//7gAOQWRvYmUAZMAAAAAB/9sAhAAQCwsLDAsQDAwQFw8NDxcbFBAQFBsfFxcXFxcfHhcaGhoaFx4eIyUnJSMeLy8zMy8vQEBAQEBAQEBAQEBAQEBAAREPDxETERUSEhUUERQRFBoUFhYUGiYaGhwaGiYwIx4eHh4jMCsuJycnLis1NTAwNTVAQD9AQEBAQEBAQEBAQED/wAARCAB4AHgDASIAAhEBAxEB/8QAcQABAQEBAQEBAAAAAAAAAAAAAAECBQQDBgEBAQAAAAAAAAAAAAAAAAAAAAEQAAIBAQELCwUBAAAAAAAAAAABAgMRITFBcZGhwRITMwXwYbHhIlJyglMEFVGB0TJCQxEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A/btkbDIAbMsWiVkf3ajzO/kV0CEJr0+9mY1qfezMgMgtp97MOx3swEIash3sxNWPezAZIb1Fgkvun1mZRkudcwEICAAQAe1k5sgZmUtWEp4VcWN9RRmpV1OzB9r+pLoR8NIKRAoAAoKAKEUKFQRQPhXTpraWW0/7SvrnswrliypRktaLtX1PVZ98Zy6il7X3MoRfYvxxMD1AxCopq3CAPcYq7vHLoTKzNTdrxaAPkUFCIUFAFQKFCoIqAFQRpIAkc3iisq05YXG7lOmkc7iu8pYtIHwpSsBmmAOszM935tBSS3fm0AfMqKUCFRUUAVIiNICWGkCpAEipBIqQBI5vFt5SxPpOokcvjG8peF9LA8tMCmAOqP8APzaCFW782gCFQRUAKgioAioFSAJGkgkVIAkVIJGkigkcrjO9peHSzrJHK4zvaXh0sDxwApgg6ZqO7fiXQYNU3fi/6vY1yYGioFAFQSNJAEipBIqQBIqQSNJFBIqQSNJAEjkca31Lw6TsHA4nWVX3Vy9G4uX2A+VMCmCDogEA+kKyc9SVybux+krL9nOfaw8VWmqkNV378X9GrzPjD33uaPYqLaJYX+wHUSKkeBcWp4abzF+Wp+nLKB70jSRzvl6fpyyl+Yp+m8vUUdFI0kc35mn6Ty9Q+ap+lLL1AdNIqRzHxunZcpO3Hb+Dz1+L16icYLUT5YPyB7uIe+hQg4Rds3cdnQcNNyk5Svt2tletOWtJ2t4TUYgbggaigQe0gAA+VWmp3cIAHnlSsM7MABsxswAJsxswAGzGoABVA3GIAH0jEAAf/9k=',
        fileName: 'NO_IMAGE',
        width: 100,
        height: 100
    };

    /**
     * Get element position (with support old browsers)
     * @param {Element} element
     * @returns {{top: number, left: number}}
     */
    function getElementPosition(element) {
        const box = element.getBoundingClientRect();

        const { body, documentElement } = document;

        const scrollTop = window.pageYOffset || documentElement.scrollTop || body.scrollTop;
        const scrollLeft = window.pageXOffset || documentElement.scrollLeft || body.scrollLeft;

        const clientTop = documentElement.clientTop || body.clientTop || 0;
        const clientLeft = documentElement.clientLeft || body.clientLeft || 0;

        const top = box.top + scrollTop - clientTop;
        const left = box.left + scrollLeft - clientLeft;

        return { top, left };
    }

    /**
     * Universal alternative to Object.assign()
     * @param {Object} destination
     * @param {Object} source
     * @returns {Object}
     */
    function extendObject(destination, source) {
        if (destination && source) {
            for (let key in source) {
                if (source.hasOwnProperty(key)) {
                    destination[key] = source[key];
                }
            }
        }

        return destination;
    }

    /**
     * @param target
     * @param type
     * @param listener
     * @param options
     */
    function on(target, type, listener, options = false) {
        target.addEventListener(type, listener, options);
    }

    /**
     * @param target
     * @param type
     * @param listener
     * @param options
     */
    function off(target, type, listener, options = false) {
        target.removeEventListener(type, listener, options);
    }

    function isTouch() {
        return 'ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }

    function eventClientX(event) {
        return event.type === 'wheel' ||
        event.type === 'mousedown' ||
        event.type === 'mousemove' ||
        event.type === 'mouseup' ? event.clientX : event.changedTouches[0].clientX;
    }

    function eventClientY(event) {
        return event.type === 'wheel' ||
        event.type === 'mousedown' ||
        event.type === 'mousemove' ||
        event.type === 'mouseup' ? event.clientY : event.changedTouches[0].clientY;
    }

    /**
     * @class DragScrollable
     * @param {Object} windowObject
     * @param {Object} contentObject
     * @param {Object} options
     * @constructor
     */
    function DragScrollable(windowObject, contentObject, options = {}) {
        this._dropHandler = this._dropHandler.bind(this);
        this._grabHandler = this._grabHandler.bind(this);
        this._moveHandler = this._moveHandler.bind(this);

        this.options = extendObject({
            // smooth extinction moving element after set loose
            smoothExtinction: false,
            // callback triggered when grabbing an element
            onGrab: null,
            // callback triggered when moving an element
            onMove: null,
            // callback triggered when dropping an element
            onDrop: null
        }, options);

        // check if we're using a touch screen
        this.isTouch = isTouch();
        // switch to touch events if using a touch screen
        this.events = this.isTouch ?
            { grab: 'touchstart', move: 'touchmove', drop: 'touchend' } :
            { grab: 'mousedown', move: 'mousemove', drop: 'mouseup' };
        // if using touch screen tells the browser that the default action will not be undone
        this.events.options = this.isTouch ? { passive: true } : false;

        this.window = windowObject;
        this.content = contentObject;

        on(this.content.$element, this.events.grab, this._grabHandler, this.events.options);
    }

    DragScrollable.prototype = {
        constructor: DragScrollable,
        window: null,
        content: null,
        isTouch: false,
        isGrab: false,
        events: null,
        moveTimer: null,
        options: {},
        coordinates: null,
        speed: null,
        _grabHandler(event) {
            // if touch started (only one finger) or pressed left mouse button
            if ((this.isTouch && event.touches.length === 1) || event.buttons === 1) {
                if (!this.isTouch) event.preventDefault();

                this.isGrab = true;
                this.coordinates = { left: eventClientX(event), top: eventClientY(event) };
                this.speed = { x: 0, y: 0 };

                on(document, this.events.drop, this._dropHandler, this.events.options);
                on(document, this.events.move, this._moveHandler, this.events.options);

                if (typeof this.options.onGrab === 'function') {
                    this.options.onGrab();
                }
            }
        },
        _dropHandler(event) {
            if (!this.isTouch) event.preventDefault();

            this.isGrab = false;

            // if (this.options.smoothExtinction) {
            //     _moveExtinction.call(this, 'scrollLeft', numberExtinction(this.speed.x));
            //     _moveExtinction.call(this, 'scrollTop', numberExtinction(this.speed.y));
            // }

            off(document, this.events.drop, this._dropHandler);
            off(document, this.events.move, this._moveHandler);

            if (typeof this.options.onDrop === 'function') {
                this.options.onDrop();
            }
        },
        _moveHandler(event) {
            if (!this.isTouch) event.preventDefault();

            const { window, content, speed, coordinates, options } = this;

            // speed of change of the coordinate of the mouse cursor along the X/Y axis
            speed.x = eventClientX(event) - coordinates.left;
            speed.y = eventClientY(event) - coordinates.top;

            clearTimeout(this.moveTimer);

            // reset speed data if cursor stops
            this.moveTimer = setTimeout(() => {
                speed.x = 0;
                speed.y = 0;
            }, 50);

            const contentNewLeft = content.currentLeft + speed.x;
            const contentNewTop = content.currentTop + speed.y;

            let maxAvailableLeft = (content.currentWidth - window.originalWidth) / 2 + content.correctX;
            let maxAvailableTop = (content.currentHeight - window.originalHeight) / 2 + content.correctY;

            // if we do not go beyond the permissible boundaries of the window
            if (Math.abs(contentNewLeft) <= maxAvailableLeft) content.currentLeft = contentNewLeft;

            // if we do not go beyond the permissible boundaries of the window
            if (Math.abs(contentNewTop) <= maxAvailableTop) content.currentTop = contentNewTop;

            _transform(content.$element, {
                left: content.currentLeft,
                top: content.currentTop,
                scale: content.currentScale
            });

            coordinates.left = eventClientX(event);
            coordinates.top = eventClientY(event);

            if (typeof options.onMove === 'function') {
                options.onMove();
            }
        },
        destroy() {
            off(this.content.$element, this.events.grab, this._grabHandler, this.events.options);

            for (let key in this) {
                if (this.hasOwnProperty(key)) {
                    this[key] = null;
                }
            }
        }
    };

    function _transform($element, { left, top, scale }) {
        $element.style.transform = `translate3d(${ left }px, ${ top }px, 0px) scale(${ scale })`;
    }

    /**
     * @class WZoom
     * @param {string} selector
     * @param {Object} options
     * @constructor
     */

    function WZoom(selector, options = {}) {
        this._init = this._init.bind(this);
        this._prepare = this._prepare.bind(this);
        this._computeNewScale = this._computeNewScale.bind(this);
        this._computeNewPosition = this._computeNewPosition.bind(this);
        this._transform = this._transform.bind(this);

        this._wheelHandler = _wheelHandler.bind(this);
        this._downHandler = _downHandler.bind(this);
        this._upHandler = _upHandler.bind(this);

        const defaults = {
            // type content: `image` - only one image, `html` - any HTML content
            type: 'image',
            // for type `image` computed auto (if width set null), for type `html` need set real html content width, else computed auto
            width: null,
            // for type `image` computed auto (if height set null), for type `html` need set real html content height, else computed auto
            height: null,
            // drag scrollable content
            dragScrollable: true,
            // options for the DragScrollable module
            dragScrollableOptions: {},
            // minimum allowed proportion of scale
            minScale: null,
            // maximum allowed proportion of scale
            maxScale: 1,
            // content resizing speed
            speed: 50,
            // zoom to maximum (minimum) size on click
            zoomOnClick: true,
            // if is true, then when the source image changes, the plugin will automatically restart init function (used with type = image)
            // attention: if false, it will work correctly only if the images are of the same size
            watchImageChange: true
        };

        this.content.$element = typeof(selector) === 'string' ? document.querySelector(selector) : selector;

        // check if we're using a touch screen
        this.isTouch = isTouch();
        // switch to touch events if using a touch screen
        this.events = this.isTouch ? { down: 'touchstart', up: 'touchend' } : { down: 'mousedown', up: 'mouseup' };
        // if using touch screen tells the browser that the default action will not be undone
        this.events.options = this.isTouch ? { passive: true } : false;

        if (this.content.$element) {
            this.options = extendObject(defaults, options);

            if (this.options.minScale && this.options.minScale >= this.options.maxScale) {
                this.options.minScale = null;
            }

            // for window take just the parent
            this.window.$element = this.content.$element.parentNode;

            console.log('this.window', this.window);

            if (this.options.type === 'image') {
                let initAlreadyDone = false;

                // if the `image` has already been loaded
                if (this.content.$element.complete) {
                    this._init();
                    initAlreadyDone = true;
                }

                if (!initAlreadyDone || this.options.watchImageChange === true) {
                    // even if the `image` has already been loaded (for "hotswap" of src support)
                    on(
                        this.content.$element, 'load', this._init,
                        // if watchImageChange == false listen add only until the first call
                        this.options.watchImageChange ? false : { once: true }
                    );
                }
            } else {
                this._init();
            }
        }
    }

    WZoom.prototype = {
        constructor: WZoom,
        isTouch: false,
        events: null,
        content: {},
        window: {},
        direction: 1,
        options: null,
        dragScrollable: null,
        // processing of the event "max / min zoom" begin only if there was really just a click
        // so as not to interfere with the DragScrollable module
        clickExpired: true,
        _init() {
            this._prepare();

            if (this.options.dragScrollable === true) {
                // this can happen if the src of this.content.$element (when type = image) is changed and repeat event load at image
                if (this.dragScrollable) {
                    this.dragScrollable.destroy();
                }

                this.dragScrollable = new DragScrollable(this.window, this.content, this.options.dragScrollableOptions);
            }

            on(this.content.$element, 'wheel', this._wheelHandler);

            if (this.options.zoomOnClick) {
                on(this.content.$element, this.events.down, this._downHandler, this.events.options);
                on(this.content.$element, this.events.up, this._upHandler, this.events.options);
            }
        },
        _prepare() {
            const windowPosition = getElementPosition(this.window.$element);

            // original window sizes and position
            this.window.originalWidth = this.window.$element.offsetWidth;
            this.window.originalHeight = this.window.$element.offsetHeight;
            this.window.positionLeft = windowPosition.left;
            this.window.positionTop = windowPosition.top;

            // original content sizes
            if (this.options.type === 'image') {
                this.content.originalWidth = this.options.width || this.content.$element.naturalWidth;
                this.content.originalHeight = this.options.height || this.content.$element.naturalHeight;
            } else {
                this.content.originalWidth = this.options.width || this.content.$element.offsetWidth;
                this.content.originalHeight = this.options.height || this.content.$element.offsetHeight;
            }

            // minScale && maxScale
            this.content.minScale = this.options.minScale || Math.min(this.window.originalWidth / this.content.originalWidth, this.window.originalHeight / this.content.originalHeight);
            this.content.maxScale = this.options.maxScale;

            // current content sizes and transform data
            this.content.currentWidth = this.content.originalWidth * this.content.minScale;
            this.content.currentHeight = this.content.originalHeight * this.content.minScale;
            this.content.currentLeft = 0;
            this.content.currentTop = 0;
            this.content.currentScale = this.content.minScale;

            // calculate indent-left and indent-top to of content from window borders
            this.content.correctX = Math.max(0, (this.window.originalWidth - this.content.currentWidth) / 2);
            this.content.correctY = Math.max(0, (this.window.originalHeight - this.content.currentHeight) / 2);

            this.content.$element.style.transform = `translate3d(0px, 0px, 0px) scale(${ this.content.minScale })`;

            if (typeof this.options.prepare === 'function') {
                this.options.prepare();
            }
        },
        _computeNewScale(delta) {
            this.direction = delta < 0 ? 1 : -1;

            const { minScale, maxScale, currentScale } = this.content;

            let contentNewScale = currentScale + (this.direction / this.options.speed);

            if (contentNewScale < minScale) {
                this.direction = 1;
            } else if (contentNewScale > maxScale) {
                this.direction = -1;
            }

            return contentNewScale < minScale ? minScale : (contentNewScale > maxScale ? maxScale : contentNewScale);
        },
        _computeNewPosition(contentNewScale, { x, y }) {
            const { window, content } = this;

            const contentNewWidth = content.originalWidth * contentNewScale;
            const contentNewHeight = content.originalHeight * contentNewScale;

            const { body, documentElement } = document;

            const scrollLeft = window.pageXOffset || documentElement.scrollLeft || body.scrollLeft;
            const scrollTop = window.pageYOffset || documentElement.scrollTop || body.scrollTop;

            // calculate the parameters along the X axis
            const leftWindowShiftX = x + scrollLeft - window.positionLeft;
            const centerWindowShiftX = window.originalWidth / 2 - leftWindowShiftX;
            const centerContentShiftX = centerWindowShiftX + content.currentLeft;
            let contentNewLeft = centerContentShiftX * (contentNewWidth / content.currentWidth) - centerContentShiftX + content.currentLeft;

            // check that the content does not go beyond the X axis
            if (this.direction === -1 && (contentNewWidth - window.originalWidth) / 2 + content.correctX < Math.abs(contentNewLeft)) {
                const positive = contentNewLeft < 0 ? -1 : 1;
                contentNewLeft = ((contentNewWidth - window.originalWidth) / 2 + content.correctX) * positive;
            }

            // calculate the parameters along the Y axis
            const topWindowShiftY = y + scrollTop - window.positionTop;
            const centerWindowShiftY = window.originalHeight / 2 - topWindowShiftY;
            const centerContentShiftY = centerWindowShiftY + content.currentTop;
            let contentNewTop = centerContentShiftY * (contentNewHeight / content.currentHeight) - centerContentShiftY + content.currentTop;

            // check that the content does not go beyond the Y axis
            if (this.direction === -1 && (contentNewHeight - window.originalHeight) / 2 + content.correctY < Math.abs(contentNewTop)) {
                const positive = contentNewTop < 0 ? -1 : 1;
                contentNewTop = ((contentNewHeight - window.originalHeight) / 2 + content.correctY) * positive;
            }

            if (contentNewScale === this.content.minScale) {
                contentNewLeft = contentNewTop = 0;
            }

            const response = {
                currentLeft: content.currentLeft,
                newLeft: contentNewLeft,
                currentTop: content.currentTop,
                newTop: contentNewTop,
                currentScale: content.currentScale,
                newScale: contentNewScale
            };

            content.currentWidth = contentNewWidth;
            content.currentHeight = contentNewHeight;
            content.currentLeft = contentNewLeft;
            content.currentTop = contentNewTop;
            content.currentScale = contentNewScale;

            return response;
        },
        _transform({ currentLeft, newLeft, currentTop, newTop, currentScale, newScale }, iterations = 1) {
            this.content.$element.style.transform = `translate3d(${ newLeft }px, ${ newTop }px, 0px) scale(${ newScale })`;

            if (typeof this.options.rescale === 'function') {
                this.options.rescale();
            }
        },
        _zoom(direction) {
            const windowPosition = getElementPosition(this.window.$element);

            const { window } = this;
            const { body, documentElement } = document;

            const scrollLeft = window.pageXOffset || documentElement.scrollLeft || body.scrollLeft;
            const scrollTop = window.pageYOffset || documentElement.scrollTop || body.scrollTop;

            this._transform(
                this._computeNewPosition(
                    this._computeNewScale(direction), {
                        x: windowPosition.left + (this.window.originalWidth / 2) - scrollLeft,
                        y: windowPosition.top + (this.window.originalHeight / 2) - scrollTop
                    }));
        },
        prepare() {
            this._prepare();
        },
        zoomUp() {
            this._zoom(-3);
        },
        zoomDown() {
            this._zoom(3);
        },
        destroy() {
            this.content.$element.style.transform = '';

            if (this.options.type === 'image') {
                off(this.content.$element, 'load', this._init);
            }

            off(this.window.$element, 'wheel', this._wheelHandler);
            off(this.content.$element, 'wheel', this._wheelHandler);

            if (this.options.zoomOnClick) {
                off(this.window.$element, this.events.down, this._downHandler, this.events.options);
                off(this.window.$element, this.events.up, this._upHandler, this.events.options);
            }

            if (this.dragScrollable) {
                this.dragScrollable.destroy();
            }

            for (let key in this) {
                if (this.hasOwnProperty(key)) {
                    this[key] = null;
                }
            }
        }
    };

    function _wheelHandler(event) {
        event.preventDefault();

        this._transform(
            this._computeNewPosition(
                this._computeNewScale(event.deltaY),
                { x: eventClientX(event), y: eventClientY(event) }
            )
        );
    }

    function _downHandler(event) {
        if ((this.isTouch && event.touches.length === 1) || event.buttons === 1) {
            this.clickExpired = false;
            setTimeout(() => this.clickExpired = true, 150);
        }
    }

    function _upHandler(event) {
        if (!this.clickExpired) {
            this._transform(
                this._computeNewPosition(
                    this.direction === 1 ? this.content.maxScale : this.content.minScale, {
                        x: eventClientX(event),
                        y: eventClientY(event)
                    }
                )
            );

            this.direction *= -1;
        }
    }

    /**
     * Create WZoom instance
     * @param {string} selector
     * @param {Object} [options]
     * @returns {WZoom}
     */
    WZoom.create = function (selector, options) {
        return new WZoom(selector, options);
    };

    /* templates\components\icons\IconMagnify.svelte generated by Svelte v3.30.0 */

    const file = "templates\\components\\icons\\IconMagnify.svelte";

    function create_fragment(ctx) {
    	let svg;
    	let circle;
    	let line0;
    	let line1;
    	let line2;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			line2 = svg_element("line");
    			attr_dev(circle, "cx", "11");
    			attr_dev(circle, "cy", "11");
    			attr_dev(circle, "r", "8");
    			add_location(circle, file, 2, 8, 143);
    			attr_dev(line0, "x1", "21");
    			attr_dev(line0, "y1", "21");
    			attr_dev(line0, "x2", "16.65");
    			attr_dev(line0, "y2", "16.65");
    			add_location(line0, file, 3, 17, 192);
    			attr_dev(line1, "x1", "11");
    			attr_dev(line1, "y1", "8");
    			attr_dev(line1, "x2", "11");
    			attr_dev(line1, "y2", "14");
    			add_location(line1, file, 4, 8, 253);
    			attr_dev(line2, "x1", "8");
    			attr_dev(line2, "y1", "11");
    			attr_dev(line2, "x2", "14");
    			attr_dev(line2, "y2", "11");
    			add_location(line2, file, 5, 8, 307);
    			attr_dev(svg, "stroke", "rgb(160,160,160)");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke-width", "2");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			add_location(svg, file, 0, 1, 1);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, circle);
    			append_dev(svg, line0);
    			append_dev(svg, line1);
    			append_dev(svg, line2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IconMagnify", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IconMagnify> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class IconMagnify extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconMagnify",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* templates\components\icons\IconDeMagnify.svelte generated by Svelte v3.30.0 */

    const file$1 = "templates\\components\\icons\\IconDeMagnify.svelte";

    function create_fragment$1(ctx) {
    	let svg;
    	let circle;
    	let line0;
    	let line1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			attr_dev(circle, "cx", "11");
    			attr_dev(circle, "cy", "11");
    			attr_dev(circle, "r", "8");
    			add_location(circle, file$1, 2, 8, 143);
    			attr_dev(line0, "x1", "21");
    			attr_dev(line0, "y1", "21");
    			attr_dev(line0, "x2", "16.65");
    			attr_dev(line0, "y2", "16.65");
    			add_location(line0, file$1, 3, 8, 192);
    			attr_dev(line1, "x1", "8");
    			attr_dev(line1, "y1", "11");
    			attr_dev(line1, "x2", "14");
    			attr_dev(line1, "y2", "11");
    			add_location(line1, file$1, 4, 8, 253);
    			attr_dev(svg, "stroke", "rgb(160,160,160)");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke-width", "2");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			add_location(svg, file$1, 0, 1, 1);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, circle);
    			append_dev(svg, line0);
    			append_dev(svg, line1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IconDeMagnify", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IconDeMagnify> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class IconDeMagnify extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconDeMagnify",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* templates\components\icons\IconChevronLeft.svelte generated by Svelte v3.30.0 */

    const file$2 = "templates\\components\\icons\\IconChevronLeft.svelte";

    function create_fragment$2(ctx) {
    	let svg;
    	let polyline0;
    	let polyline1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polyline0 = svg_element("polyline");
    			polyline1 = svg_element("polyline");
    			attr_dev(polyline0, "points", "30 10 10 30 30 50");
    			attr_dev(polyline0, "stroke", "rgba(0,0,0,0.5)");
    			attr_dev(polyline0, "stroke-width", "8");
    			attr_dev(polyline0, "stroke-linecap", "square");
    			attr_dev(polyline0, "fill", "none");
    			attr_dev(polyline0, "stroke-linejoin", "round");
    			add_location(polyline0, file$2, 1, 4, 34);
    			attr_dev(polyline1, "points", "30 10 10 30 30 50");
    			attr_dev(polyline1, "stroke", "rgba(255,255,255,0.5)");
    			attr_dev(polyline1, "stroke-width", "4");
    			attr_dev(polyline1, "stroke-linecap", "square");
    			attr_dev(polyline1, "fill", "none");
    			attr_dev(polyline1, "stroke-linejoin", "round");
    			add_location(polyline1, file$2, 3, 4, 187);
    			attr_dev(svg, "width", "44");
    			attr_dev(svg, "height", "60");
    			add_location(svg, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polyline0);
    			append_dev(svg, polyline1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IconChevronLeft", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IconChevronLeft> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class IconChevronLeft extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconChevronLeft",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* templates\components\icons\IconChevronRight.svelte generated by Svelte v3.30.0 */

    const file$3 = "templates\\components\\icons\\IconChevronRight.svelte";

    function create_fragment$3(ctx) {
    	let svg;
    	let polyline0;
    	let polyline1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polyline0 = svg_element("polyline");
    			polyline1 = svg_element("polyline");
    			attr_dev(polyline0, "points", "14 10 34 30 14 50");
    			attr_dev(polyline0, "stroke", "rgba(0,0,0,0.5)");
    			attr_dev(polyline0, "stroke-width", "8");
    			attr_dev(polyline0, "stroke-linecap", "square");
    			attr_dev(polyline0, "fill", "none");
    			attr_dev(polyline0, "stroke-linejoin", "round");
    			add_location(polyline0, file$3, 1, 4, 34);
    			attr_dev(polyline1, "points", "14 10 34 30 14 50");
    			attr_dev(polyline1, "stroke", "rgba(255,255,255,0.5)");
    			attr_dev(polyline1, "stroke-width", "4");
    			attr_dev(polyline1, "stroke-linecap", "square");
    			attr_dev(polyline1, "fill", "none");
    			attr_dev(polyline1, "stroke-linejoin", "round");
    			add_location(polyline1, file$3, 3, 4, 187);
    			attr_dev(svg, "width", "44");
    			attr_dev(svg, "height", "60");
    			add_location(svg, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polyline0);
    			append_dev(svg, polyline1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IconChevronRight", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IconChevronRight> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class IconChevronRight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconChevronRight",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* templates\components\icons\IconX.svelte generated by Svelte v3.30.0 */

    const file$4 = "templates\\components\\icons\\IconX.svelte";

    function create_fragment$4(ctx) {
    	let svg;
    	let g;
    	let line0;
    	let line1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			attr_dev(line0, "x1", "11");
    			attr_dev(line0, "y1", "11");
    			attr_dev(line0, "x2", "31");
    			attr_dev(line0, "y2", "31");
    			add_location(line0, file$4, 2, 8, 90);
    			attr_dev(line1, "x1", "11");
    			attr_dev(line1, "y1", "31");
    			attr_dev(line1, "x2", "31");
    			attr_dev(line1, "y2", "11");
    			add_location(line1, file$4, 3, 8, 139);
    			attr_dev(g, "stroke", "rgb(160,160,160)");
    			attr_dev(g, "stroke-width", "4");
    			add_location(g, file$4, 1, 4, 34);
    			attr_dev(svg, "width", "36");
    			attr_dev(svg, "height", "36");
    			add_location(svg, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, line0);
    			append_dev(g, line1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IconX", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IconX> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class IconX extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconX",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* templates\components\lightbox\Lightbox.svelte generated by Svelte v3.30.0 */

    const { console: console_1 } = globals;
    const file$5 = "templates\\components\\lightbox\\Lightbox.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i][0];
    	child_ctx[45] = list[i][1];
    	child_ctx[46] = list[i][2];
    	child_ctx[47] = list[i][3];
    	child_ctx[48] = list[i][4];
    	child_ctx[49] = list[i][5];
    	return child_ctx;
    }

    // (213:0) {#if active}
    function create_if_block(ctx) {
    	let div8;
    	let div0;
    	let iconmagnify;
    	let t0;
    	let div1;
    	let icondemagnify;
    	let t1;
    	let div2;
    	let iconx;
    	let t2;
    	let div3;
    	let iconchevronleft;
    	let t3;
    	let div4;
    	let iconchevronright;
    	let t4;
    	let t5;
    	let div7;
    	let div5;
    	let t6;
    	let div6;
    	let div8_class_value;
    	let div8_intro;
    	let div8_outro;
    	let current;
    	let mounted;
    	let dispose;
    	iconmagnify = new IconMagnify({ $$inline: true });
    	icondemagnify = new IconDeMagnify({ $$inline: true });
    	iconx = new IconX({ $$inline: true });
    	iconchevronleft = new IconChevronLeft({ $$inline: true });
    	iconchevronright = new IconChevronRight({ $$inline: true });
    	let if_block = /*arrived*/ ctx[3] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div0 = element("div");
    			create_component(iconmagnify.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(icondemagnify.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			create_component(iconx.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			create_component(iconchevronleft.$$.fragment);
    			t3 = space();
    			div4 = element("div");
    			create_component(iconchevronright.$$.fragment);
    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			div7 = element("div");
    			div5 = element("div");
    			t6 = space();
    			div6 = element("div");
    			div6.textContent = "Download";
    			attr_dev(div0, "class", "icon-button magnify svelte-10pajrg");
    			add_location(div0, file$5, 215, 4, 6913);
    			attr_dev(div1, "class", "icon-button de-magnify svelte-10pajrg");
    			add_location(div1, file$5, 216, 4, 6991);
    			attr_dev(div2, "class", "icon-button close-me svelte-10pajrg");
    			add_location(div2, file$5, 217, 4, 7075);
    			attr_dev(div3, "class", "prior svelte-10pajrg");
    			add_location(div3, file$5, 219, 4, 7151);
    			attr_dev(div4, "class", "next svelte-10pajrg");
    			add_location(div4, file$5, 220, 4, 7222);
    			attr_dev(div5, "class", "description");
    			add_location(div5, file$5, 249, 8, 8473);
    			attr_dev(div6, "class", "download-button");
    			add_location(div6, file$5, 250, 8, 8514);
    			attr_dev(div7, "class", "description-panel svelte-10pajrg");
    			add_location(div7, file$5, 248, 4, 8432);
    			attr_dev(div8, "class", div8_class_value = "" + (null_to_empty(/*lightboxClass*/ ctx[10]) + " svelte-10pajrg"));
    			add_location(div8, file$5, 213, 0, 6861);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div0);
    			mount_component(iconmagnify, div0, null);
    			append_dev(div8, t0);
    			append_dev(div8, div1);
    			mount_component(icondemagnify, div1, null);
    			append_dev(div8, t1);
    			append_dev(div8, div2);
    			mount_component(iconx, div2, null);
    			append_dev(div8, t2);
    			append_dev(div8, div3);
    			mount_component(iconchevronleft, div3, null);
    			append_dev(div8, t3);
    			append_dev(div8, div4);
    			mount_component(iconchevronright, div4, null);
    			append_dev(div8, t4);
    			if (if_block) if_block.m(div8, null);
    			append_dev(div8, t5);
    			append_dev(div8, div7);
    			append_dev(div7, div5);
    			append_dev(div7, t6);
    			append_dev(div7, div6);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*zoomIn*/ ctx[17], false, false, false),
    					listen_dev(div1, "click", /*zoomOut*/ ctx[18], false, false, false),
    					listen_dev(div2, "click", /*closeMe*/ ctx[13], false, false, false),
    					listen_dev(div3, "click", /*showPrior*/ ctx[22], false, false, false),
    					listen_dev(div4, "click", /*showNext*/ ctx[21], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*arrived*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*arrived*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div8, t5);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*lightboxClass*/ 1024 && div8_class_value !== (div8_class_value = "" + (null_to_empty(/*lightboxClass*/ ctx[10]) + " svelte-10pajrg"))) {
    				attr_dev(div8, "class", div8_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconmagnify.$$.fragment, local);
    			transition_in(icondemagnify.$$.fragment, local);
    			transition_in(iconx.$$.fragment, local);
    			transition_in(iconchevronleft.$$.fragment, local);
    			transition_in(iconchevronright.$$.fragment, local);
    			transition_in(if_block);

    			add_render_callback(() => {
    				if (div8_outro) div8_outro.end(1);
    				if (!div8_intro) div8_intro = create_in_transition(div8, fade, {});
    				div8_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconmagnify.$$.fragment, local);
    			transition_out(icondemagnify.$$.fragment, local);
    			transition_out(iconx.$$.fragment, local);
    			transition_out(iconchevronleft.$$.fragment, local);
    			transition_out(iconchevronright.$$.fragment, local);
    			transition_out(if_block);
    			if (div8_intro) div8_intro.invalidate();
    			div8_outro = create_out_transition(div8, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			destroy_component(iconmagnify);
    			destroy_component(icondemagnify);
    			destroy_component(iconx);
    			destroy_component(iconchevronleft);
    			destroy_component(iconchevronright);
    			if (if_block) if_block.d();
    			if (detaching && div8_outro) div8_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(213:0) {#if active}",
    		ctx
    	});

    	return block;
    }

    // (223:4) {#if arrived}
    function create_if_block_1(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let img;
    	let img_src_value;
    	let div1_intro;
    	let div1_outro;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = !/*loaded*/ ctx[0] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			img = element("img");
    			if (img.src !== (img_src_value = /*src*/ ctx[5])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "srcset", /*srcset*/ ctx[6]);
    			attr_dev(img, "alt", /*alt*/ ctx[4]);
    			attr_dev(img, "class", "svelte-10pajrg");
    			add_location(img, file$5, 243, 12, 8293);
    			attr_dev(div0, "class", "photo svelte-10pajrg");
    			attr_dev(div0, "style", /*photoScale*/ ctx[12]);
    			add_location(div0, file$5, 224, 8, 7372);
    			attr_dev(div1, "class", "photo-frame svelte-10pajrg");
    			add_location(div1, file$5, 223, 4, 7313);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t);
    			append_dev(div0, img);
    			/*img_binding*/ ctx[33](img);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(img, "load", /*onImageLoad*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!/*loaded*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*loaded*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*src*/ 32 && img.src !== (img_src_value = /*src*/ ctx[5])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty[0] & /*srcset*/ 64) {
    				attr_dev(img, "srcset", /*srcset*/ ctx[6]);
    			}

    			if (!current || dirty[0] & /*alt*/ 16) {
    				attr_dev(img, "alt", /*alt*/ ctx[4]);
    			}

    			if (!current || dirty[0] & /*photoScale*/ 4096) {
    				attr_dev(div0, "style", /*photoScale*/ ctx[12]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, /*slideIn*/ ctx[20], {});
    				div1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, /*slideOut*/ ctx[19], {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			/*img_binding*/ ctx[33](null);
    			if (detaching && div1_outro) div1_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(223:4) {#if arrived}",
    		ctx
    	});

    	return block;
    }

    // (227:12) {#if !loaded}
    function create_if_block_2(ctx) {
    	let div;
    	let svg;
    	let g;
    	let svg_viewBox_value;
    	let div_class_value;
    	let div_outro;
    	let current;
    	let if_block = !/*loaded*/ ctx[0] && create_if_block_3(ctx);
    	let each_value = /*svgSequence*/ ctx[7];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(g, file$5, 234, 24, 7931);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*svgWidth*/ ctx[9] + " " + /*svgHeight*/ ctx[8]);
    			attr_dev(svg, "class", "svelte-10pajrg");
    			add_location(svg, file$5, 228, 20, 7527);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*photoSvgClass*/ ctx[11]) + " svelte-10pajrg"));
    			add_location(div, file$5, 227, 16, 7457);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, g);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!/*loaded*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*loaded*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(svg, g);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*svgSequence*/ 128) {
    				each_value = /*svgSequence*/ ctx[7];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty[0] & /*svgWidth, svgHeight*/ 768 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*svgWidth*/ ctx[9] + " " + /*svgHeight*/ ctx[8])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (!current || dirty[0] & /*photoSvgClass*/ 2048 && div_class_value !== (div_class_value = "" + (null_to_empty(/*photoSvgClass*/ ctx[11]) + " svelte-10pajrg"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			if (div_outro) div_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			div_outro = create_out_transition(div, fade, /*fadeSlow*/ ctx[15]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(227:12) {#if !loaded}",
    		ctx
    	});

    	return block;
    }

    // (231:24) {#if !loaded}
    function create_if_block_3(ctx) {
    	let rect;
    	let rect_outro;
    	let current;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", /*svgWidth*/ ctx[9]);
    			attr_dev(rect, "height", /*svgHeight*/ ctx[8]);
    			attr_dev(rect, "fill", "#f0f0f0");
    			add_location(rect, file$5, 231, 28, 7749);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty[0] & /*svgWidth*/ 512) {
    				attr_dev(rect, "width", /*svgWidth*/ ctx[9]);
    			}

    			if (!current || dirty[0] & /*svgHeight*/ 256) {
    				attr_dev(rect, "height", /*svgHeight*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (rect_outro) rect_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			rect_outro = create_out_transition(rect, fade, /*fadeQuick*/ ctx[16]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    			if (detaching && rect_outro) rect_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(231:24) {#if !loaded}",
    		ctx
    	});

    	return block;
    }

    // (236:28) {#each svgSequence as [ fill, opacity, cx, cy, rx, ry ] }
    function create_each_block(ctx) {
    	let ellipse;
    	let ellipse_fill_value;
    	let ellipse_fill_opacity_value;
    	let ellipse_cx_value;
    	let ellipse_cy_value;
    	let ellipse_rx_value;
    	let ellipse_ry_value;

    	const block = {
    		c: function create() {
    			ellipse = svg_element("ellipse");
    			attr_dev(ellipse, "fill", ellipse_fill_value = /*fill*/ ctx[44]);
    			attr_dev(ellipse, "fill-opacity", ellipse_fill_opacity_value = /*opacity*/ ctx[45]);
    			attr_dev(ellipse, "cx", ellipse_cx_value = /*cx*/ ctx[46]);
    			attr_dev(ellipse, "cy", ellipse_cy_value = /*cy*/ ctx[47]);
    			attr_dev(ellipse, "rx", ellipse_rx_value = /*rx*/ ctx[48]);
    			attr_dev(ellipse, "ry", ellipse_ry_value = /*ry*/ ctx[49]);
    			add_location(ellipse, file$5, 236, 32, 8055);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ellipse, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*svgSequence*/ 128 && ellipse_fill_value !== (ellipse_fill_value = /*fill*/ ctx[44])) {
    				attr_dev(ellipse, "fill", ellipse_fill_value);
    			}

    			if (dirty[0] & /*svgSequence*/ 128 && ellipse_fill_opacity_value !== (ellipse_fill_opacity_value = /*opacity*/ ctx[45])) {
    				attr_dev(ellipse, "fill-opacity", ellipse_fill_opacity_value);
    			}

    			if (dirty[0] & /*svgSequence*/ 128 && ellipse_cx_value !== (ellipse_cx_value = /*cx*/ ctx[46])) {
    				attr_dev(ellipse, "cx", ellipse_cx_value);
    			}

    			if (dirty[0] & /*svgSequence*/ 128 && ellipse_cy_value !== (ellipse_cy_value = /*cy*/ ctx[47])) {
    				attr_dev(ellipse, "cy", ellipse_cy_value);
    			}

    			if (dirty[0] & /*svgSequence*/ 128 && ellipse_rx_value !== (ellipse_rx_value = /*rx*/ ctx[48])) {
    				attr_dev(ellipse, "rx", ellipse_rx_value);
    			}

    			if (dirty[0] & /*svgSequence*/ 128 && ellipse_ry_value !== (ellipse_ry_value = /*ry*/ ctx[49])) {
    				attr_dev(ellipse, "ry", ellipse_ry_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ellipse);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(236:28) {#each svgSequence as [ fill, opacity, cx, cy, rx, ry ] }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*active*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*active*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*active*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $GalleryStore;
    	validate_store(GalleryStore, "GalleryStore");
    	component_subscribe($$self, GalleryStore, $$value => $$invalidate(24, $GalleryStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Lightbox", slots, []);
    	let loaded = false;
    	let slideDirection = "";

    	// let scale = 1;
    	let imgEl;

    	let zoomer;
    	const srcSizes = [["tiny", "400w"], ["small", "600w"], ["medium", "1180w"], ["large", "1700w"]];
    	const getSrcSizes = fileName => ([size, width]) => getSizedPath(size, fileName) + " " + width;

    	const closeMe = () => {
    		slideDirection = "";
    		$$invalidate(0, loaded = false);

    		// scale = 1;
    		if (zoomer) {
    			zoomer.destroy();
    			$$invalidate(23, zoomer = null);
    		}

    		GalleryStore.closeLightbox();
    	};

    	const onImageLoad = () => {
    		console.log("lightbox loaded?", loaded);
    		$$invalidate(0, loaded = true);

    		if (!zoomer) {
    			const zoomProps = {
    				minScale: 1,
    				maxScale: 5,
    				speed: 10,
    				dragScrollableOptions: { smoothExtinction: true },
    				zoomOnClick: false
    			}; // width: workingWidth,
    			// height: workingHeight

    			$$invalidate(23, zoomer = WZoom.create(imgEl, zoomProps));
    			console.log("zoomer!", zoomer);
    		}
    	};

    	const fadeSlow = { delay: 200, duration: 600 };
    	const fadeQuick = { delay: 100, duration: 300 };

    	const composeScale = (height, width) => {
    		const ratio = height / width;

    		if (ratio > 1) {
    			return "width:" + (getDocHeight() / ratio).toFixed(1) + "px; " + "height:" + getDocHeight() + "px;";
    		}

    		return "width:" + getDocWidth() + "px; " + "height:" + (getDocWidth() * ratio).toFixed(1) + "px;";
    	};

    	const calcHeight = data => {
    		const { width, height } = data;
    		const ratio = height / width;

    		if (ratio > 1) {
    			return getDocHeight() + "px";
    		}

    		return (getDocWidth() * ratio).toFixed(1) + "px";
    	};

    	const calcWidth = data => {
    		const { width, height } = data;
    		const ratio = height / width;

    		if (ratio > 1) {
    			return (getDocHeight() / ratio).toFixed(1) + "px";
    		}

    		return getDocWidth() + "px";
    	};

    	const reset = () => {
    		$$invalidate(0, loaded = false);
    	};

    	const zoomIn = () => {
    		if (zoomer) {
    			zoomer.zoomUp();
    		}
    	}; // scale = (scale * 1.33 >= 5 ? 5 : scale * 1.33);
    	// photoScale = composeScale(height, width, scale);

    	const zoomOut = () => {
    		if (zoomer) {
    			zoomer.zoomDown();
    		}
    	}; // scale = (scale * 0.7 <= 1 ? 1 : scale * 0.7);
    	// photoScale = composeScale(height, width, scale);

    	function slideOut(node, { delay = 0, duration = 150 }) {
    		return {
    			delay,
    			duration,
    			css: t => {
    				if (!slideDirection) {
    					return "";
    				}

    				const direction = slideDirection === "forward" ? 1 : -1;
    				const eased = sineOut(t);
    				return `transform: translate(${direction * (-105 + eased * 105)}%, 0)`;
    			}
    		};
    	}

    	function slideIn(node, { delay = 0, duration = 350 }) {
    		return {
    			delay,
    			duration,
    			css: t => {
    				if (!slideDirection) {
    					return "";
    				}

    				const direction = slideDirection === "forward" ? 1 : -1;
    				const eased = sineOut(t);
    				return `transform: translate(${direction * (105 - eased * 105)}%, 0)`;
    			}
    		};
    	}

    	const showNext = () => {
    		slideDirection = "forward";

    		if (zoomer) {
    			zoomer.destroy();
    			$$invalidate(23, zoomer = null);
    		}

    		$$invalidate(3, arrived = false);

    		const nextIndex = currentIndex === $GalleryStore.images.length - 1
    		? 0
    		: currentIndex + 1;

    		const nextFileName = $GalleryStore.images[nextIndex].fileName;

    		setTimeout(
    			() => {
    				$$invalidate(0, loaded = false);
    				GalleryStore.viewLightbox(nextFileName);

    				setTimeout(
    					() => {
    						if (zoomer) {
    							zoomer.prepare();
    						}
    					},
    					400
    				);
    			},
    			140
    		);
    	};

    	const showPrior = () => {
    		slideDirection = "previous";

    		if (zoomer) {
    			zoomer.destroy();
    			$$invalidate(23, zoomer = null);
    		}

    		$$invalidate(3, arrived = false);

    		const priorIndex = currentIndex === 0
    		? $GalleryStore.images.length - 1
    		: currentIndex - 1;

    		const priorFileName = $GalleryStore.images[priorIndex].fileName;

    		setTimeout(
    			() => {
    				$$invalidate(0, loaded = false);
    				GalleryStore.viewLightbox(priorFileName);

    				setTimeout(
    					() => {
    						if (zoomer) {
    							zoomer.prepare();
    						}
    					},
    					400
    				);
    			},
    			140
    		);
    	};

    	onMount(reset);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Lightbox> was created with unknown prop '${key}'`);
    	});

    	function img_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			imgEl = $$value;
    			$$invalidate(2, imgEl);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		fade,
    		sineOut,
    		GalleryStore,
    		getSizedPath,
    		getDocHeight,
    		getDocWidth,
    		dummyImage,
    		WZoom,
    		IconMagnify,
    		IconDeMagnify,
    		IconChevronLeft,
    		IconChevronRight,
    		IconX,
    		loaded,
    		slideDirection,
    		imgEl,
    		zoomer,
    		srcSizes,
    		getSrcSizes,
    		closeMe,
    		onImageLoad,
    		fadeSlow,
    		fadeQuick,
    		composeScale,
    		calcHeight,
    		calcWidth,
    		reset,
    		zoomIn,
    		zoomOut,
    		slideOut,
    		slideIn,
    		showNext,
    		showPrior,
    		active,
    		$GalleryStore,
    		current,
    		arrived,
    		currentIndex,
    		imgData,
    		data,
    		fileName,
    		width,
    		height,
    		ratio,
    		workingHeight,
    		workingWidth,
    		photoClass,
    		alt,
    		src,
    		srcset,
    		svgSequence,
    		svgHeight,
    		svgWidth,
    		lightboxClass,
    		photoSvgClass,
    		photoScale
    	});

    	$$self.$inject_state = $$props => {
    		if ("loaded" in $$props) $$invalidate(0, loaded = $$props.loaded);
    		if ("slideDirection" in $$props) slideDirection = $$props.slideDirection;
    		if ("imgEl" in $$props) $$invalidate(2, imgEl = $$props.imgEl);
    		if ("zoomer" in $$props) $$invalidate(23, zoomer = $$props.zoomer);
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    		if ("current" in $$props) $$invalidate(25, current = $$props.current);
    		if ("arrived" in $$props) $$invalidate(3, arrived = $$props.arrived);
    		if ("currentIndex" in $$props) $$invalidate(26, currentIndex = $$props.currentIndex);
    		if ("imgData" in $$props) $$invalidate(27, imgData = $$props.imgData);
    		if ("data" in $$props) $$invalidate(28, data = $$props.data);
    		if ("fileName" in $$props) $$invalidate(29, fileName = $$props.fileName);
    		if ("width" in $$props) $$invalidate(30, width = $$props.width);
    		if ("height" in $$props) $$invalidate(31, height = $$props.height);
    		if ("ratio" in $$props) $$invalidate(32, ratio = $$props.ratio);
    		if ("workingHeight" in $$props) workingHeight = $$props.workingHeight;
    		if ("workingWidth" in $$props) workingWidth = $$props.workingWidth;
    		if ("photoClass" in $$props) photoClass = $$props.photoClass;
    		if ("alt" in $$props) $$invalidate(4, alt = $$props.alt);
    		if ("src" in $$props) $$invalidate(5, src = $$props.src);
    		if ("srcset" in $$props) $$invalidate(6, srcset = $$props.srcset);
    		if ("svgSequence" in $$props) $$invalidate(7, svgSequence = $$props.svgSequence);
    		if ("svgHeight" in $$props) $$invalidate(8, svgHeight = $$props.svgHeight);
    		if ("svgWidth" in $$props) $$invalidate(9, svgWidth = $$props.svgWidth);
    		if ("lightboxClass" in $$props) $$invalidate(10, lightboxClass = $$props.lightboxClass);
    		if ("photoSvgClass" in $$props) $$invalidate(11, photoSvgClass = $$props.photoSvgClass);
    		if ("photoScale" in $$props) $$invalidate(12, photoScale = $$props.photoScale);
    	};

    	let active;
    	let current;
    	let arrived;
    	let currentIndex;
    	let imgData;
    	let data;
    	let fileName;
    	let width;
    	let height;
    	let ratio;
    	let workingHeight;
    	let workingWidth;
    	let photoClass;
    	let alt;
    	let src;
    	let srcset;
    	let svgSequence;
    	let svgHeight;
    	let svgWidth;
    	let lightboxClass;
    	let photoSvgClass;
    	let photoScale;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$GalleryStore*/ 16777216) {
    			 $$invalidate(1, active = $GalleryStore.active);
    		}

    		if ($$self.$$.dirty[0] & /*$GalleryStore*/ 16777216) {
    			 $$invalidate(25, current = $GalleryStore.current);
    		}

    		if ($$self.$$.dirty[0] & /*$GalleryStore*/ 16777216) {
    			 $$invalidate(3, arrived = $GalleryStore.active);
    		}

    		if ($$self.$$.dirty[0] & /*$GalleryStore, current*/ 50331648) {
    			 $$invalidate(26, currentIndex = $GalleryStore.images.findIndex(next => next.fileName === current));
    		}

    		if ($$self.$$.dirty[0] & /*$GalleryStore, currentIndex*/ 83886080) {
    			 $$invalidate(27, imgData = $GalleryStore.images[currentIndex]);
    		}

    		if ($$self.$$.dirty[0] & /*imgData*/ 134217728) {
    			 $$invalidate(28, data = imgData || dummyImage);
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 268435456) {
    			 $$invalidate(29, fileName = data.fileName);
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 268435456) {
    			 $$invalidate(30, width = data.width);
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 268435456) {
    			 $$invalidate(31, height = data.height);
    		}

    		if ($$self.$$.dirty[0] & /*width*/ 1073741824 | $$self.$$.dirty[1] & /*height*/ 1) {
    			 $$invalidate(32, ratio = height / width);
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 268435456) {
    			 workingHeight = calcHeight(data);
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 268435456) {
    			 workingWidth = calcWidth(data);
    		}

    		if ($$self.$$.dirty[1] & /*ratio*/ 2) {
    			 photoClass = "photo " + (ratio > 1 ? "tall" : ratio < 1 ? "wide" : "square");
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 268435456) {
    			 $$invalidate(4, alt = data.description ? data.height.slice(0, 10) : "image");
    		}

    		if ($$self.$$.dirty[0] & /*active, fileName*/ 536870914) {
    			 $$invalidate(5, src = active ? getSizedPath("small", fileName) : "");
    		}

    		if ($$self.$$.dirty[0] & /*active, zoomer, fileName*/ 545259522) {
    			 $$invalidate(6, srcset = !active
    			? ""
    			: Boolean(zoomer)
    				? getSizedPath("large", fileName) + " 300w"
    				: srcSizes.map(getSrcSizes(fileName)).join(","));
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 268435456) {
    			 $$invalidate(7, svgSequence = data.svgSequence);
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 268435456) {
    			 $$invalidate(8, svgHeight = data.svgHeight);
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 268435456) {
    			 $$invalidate(9, svgWidth = data.svgWidth);
    		}

    		if ($$self.$$.dirty[0] & /*active*/ 2) {
    			 $$invalidate(10, lightboxClass = "lightbox" + (active ? " active" : ""));
    		}

    		if ($$self.$$.dirty[0] & /*loaded*/ 1) {
    			 $$invalidate(11, photoSvgClass = "photo-svg" + (loaded ? " image-loaded" : ""));
    		}

    		if ($$self.$$.dirty[0] & /*width*/ 1073741824 | $$self.$$.dirty[1] & /*height*/ 1) {
    			 $$invalidate(12, photoScale = composeScale(height, width));
    		}
    	};

    	return [
    		loaded,
    		active,
    		imgEl,
    		arrived,
    		alt,
    		src,
    		srcset,
    		svgSequence,
    		svgHeight,
    		svgWidth,
    		lightboxClass,
    		photoSvgClass,
    		photoScale,
    		closeMe,
    		onImageLoad,
    		fadeSlow,
    		fadeQuick,
    		zoomIn,
    		zoomOut,
    		slideOut,
    		slideIn,
    		showNext,
    		showPrior,
    		zoomer,
    		$GalleryStore,
    		current,
    		currentIndex,
    		imgData,
    		data,
    		fileName,
    		width,
    		height,
    		ratio,
    		img_binding
    	];
    }

    class Lightbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lightbox",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    function flip(node, animation, params) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    // external events
    const FINALIZE_EVENT_NAME = "finalize";
    const CONSIDER_EVENT_NAME = "consider";

    /**
     * @typedef {Object} Info
     * @property {string} trigger
     * @property {string} id
     * @property {string} source
     * @param {Node} el
     * @param {Array} items
     * @param {Info} info
     */
    function dispatchFinalizeEvent(el, items, info) {
        el.dispatchEvent(
            new CustomEvent(FINALIZE_EVENT_NAME, {
                detail: {items, info}
            })
        );
    }

    /**
     * Dispatches a consider event
     * @param {Node} el
     * @param {Array} items
     * @param {Info} info
     */
    function dispatchConsiderEvent(el, items, info) {
        el.dispatchEvent(
            new CustomEvent(CONSIDER_EVENT_NAME, {
                detail: {items, info}
            })
        );
    }

    // internal events
    const DRAGGED_ENTERED_EVENT_NAME = "draggedEntered";
    const DRAGGED_LEFT_EVENT_NAME = "draggedLeft";
    const DRAGGED_OVER_INDEX_EVENT_NAME = "draggedOverIndex";
    const DRAGGED_LEFT_DOCUMENT_EVENT_NAME = "draggedLeftDocument";
    function dispatchDraggedElementEnteredContainer(containerEl, indexObj, draggedEl) {
        containerEl.dispatchEvent(
            new CustomEvent(DRAGGED_ENTERED_EVENT_NAME, {
                detail: {indexObj, draggedEl}
            })
        );
    }
    function dispatchDraggedElementLeftContainer(containerEl, draggedEl) {
        containerEl.dispatchEvent(
            new CustomEvent(DRAGGED_LEFT_EVENT_NAME, {
                detail: {draggedEl}
            })
        );
    }
    function dispatchDraggedElementIsOverIndex(containerEl, indexObj, draggedEl) {
        containerEl.dispatchEvent(
            new CustomEvent(DRAGGED_OVER_INDEX_EVENT_NAME, {
                detail: {indexObj, draggedEl}
            })
        );
    }
    function dispatchDraggedLeftDocument(draggedEl) {
        window.dispatchEvent(
            new CustomEvent(DRAGGED_LEFT_DOCUMENT_EVENT_NAME, {
                detail: {draggedEl}
            })
        );
    }

    const TRIGGERS = {
        DRAG_STARTED: "dragStarted",
        DRAGGED_ENTERED: DRAGGED_ENTERED_EVENT_NAME,
        DRAGGED_OVER_INDEX: DRAGGED_OVER_INDEX_EVENT_NAME,
        DRAGGED_LEFT: DRAGGED_LEFT_EVENT_NAME,
        DROPPED_INTO_ZONE: "droppedIntoZone",
        DROPPED_INTO_ANOTHER: "droppedIntoAnother",
        DROPPED_OUTSIDE_OF_ANY: "droppedOutsideOfAny",
        DRAG_STOPPED: "dragStopped"
    };
    const SOURCES = {
        POINTER: "pointer",
        KEYBOARD: "keyboard"
    };

    const SHADOW_ITEM_MARKER_PROPERTY_NAME = "isDndShadowItem";
    let ITEM_ID_KEY = "id";
    let activeDndZoneCount = 0;
    function incrementActiveDropZoneCount() {
        activeDndZoneCount++;
    }
    function decrementActiveDropZoneCount() {
        if (activeDndZoneCount === 0) {
            throw new Error("Bug! trying to decrement when there are no dropzones");
        }
        activeDndZoneCount--;
    }

    const isOnServer = typeof window === "undefined";

    // This is based off https://stackoverflow.com/questions/27745438/how-to-compute-getboundingclientrect-without-considering-transforms/57876601#57876601
    // It removes the transforms that are potentially applied by the flip animations
    function adjustedBoundingRect(el) {
        let ta;
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const tx = style.transform;

        if (tx) {
            let sx, sy, dx, dy;
            if (tx.startsWith("matrix3d(")) {
                ta = tx.slice(9, -1).split(/, /);
                sx = +ta[0];
                sy = +ta[5];
                dx = +ta[12];
                dy = +ta[13];
            } else if (tx.startsWith("matrix(")) {
                ta = tx.slice(7, -1).split(/, /);
                sx = +ta[0];
                sy = +ta[3];
                dx = +ta[4];
                dy = +ta[5];
            } else {
                return rect;
            }

            const to = style.transformOrigin;
            const x = rect.x - dx - (1 - sx) * parseFloat(to);
            const y = rect.y - dy - (1 - sy) * parseFloat(to.slice(to.indexOf(" ") + 1));
            const w = sx ? rect.width / sx : el.offsetWidth;
            const h = sy ? rect.height / sy : el.offsetHeight;
            return {
                x: x,
                y: y,
                width: w,
                height: h,
                top: y,
                right: x + w,
                bottom: y + h,
                left: x
            };
        } else {
            return rect;
        }
    }

    /**
     * Gets the absolute bounding rect (accounts for the window's scroll position and removes transforms)
     * @param {HTMLElement} el
     * @return {{top: number, left: number, bottom: number, right: number}}
     */
    function getAbsoluteRectNoTransforms(el) {
        const rect = adjustedBoundingRect(el);
        return {
            top: rect.top + window.scrollY,
            bottom: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            right: rect.right + window.scrollX
        };
    }

    /**
     * Gets the absolute bounding rect (accounts for the window's scroll position)
     * @param {HTMLElement} el
     * @return {{top: number, left: number, bottom: number, right: number}}
     */
    function getAbsoluteRect(el) {
        const rect = el.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            bottom: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            right: rect.right + window.scrollX
        };
    }

    /**
     * finds the center :)
     * @typedef {Object} Rect
     * @property {number} top
     * @property {number} bottom
     * @property {number} left
     * @property {number} right
     * @param {Rect} rect
     * @return {{x: number, y: number}}
     */
    function findCenter(rect) {
        return {
            x: (rect.left + rect.right) / 2,
            y: (rect.top + rect.bottom) / 2
        };
    }

    /**
     * @typedef {Object} Point
     * @property {number} x
     * @property {number} y
     * @param {Point} pointA
     * @param {Point} pointB
     * @return {number}
     */
    function calcDistance(pointA, pointB) {
        return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
    }

    /**
     * @param {Point} point
     * @param {Rect} rect
     * @return {boolean|boolean}
     */
    function isPointInsideRect(point, rect) {
        return point.y <= rect.bottom && point.y >= rect.top && point.x >= rect.left && point.x <= rect.right;
    }

    /**
     * find the absolute coordinates of the center of a dom element
     * @param el {HTMLElement}
     * @returns {{x: number, y: number}}
     */
    function findCenterOfElement(el) {
        return findCenter(getAbsoluteRect(el));
    }

    /**
     * @param {HTMLElement} elA
     * @param {HTMLElement} elB
     * @return {boolean}
     */
    function isCenterOfAInsideB(elA, elB) {
        const centerOfA = findCenterOfElement(elA);
        const rectOfB = getAbsoluteRectNoTransforms(elB);
        return isPointInsideRect(centerOfA, rectOfB);
    }

    /**
     * @param {HTMLElement|ChildNode} elA
     * @param {HTMLElement|ChildNode} elB
     * @return {number}
     */
    function calcDistanceBetweenCenters(elA, elB) {
        const centerOfA = findCenterOfElement(elA);
        const centerOfB = findCenterOfElement(elB);
        return calcDistance(centerOfA, centerOfB);
    }

    /**
     * @param {HTMLElement} el - the element to check
     * @returns {boolean} - true if the element in its entirety is off screen including the scrollable area (the normal dom events look at the mouse rather than the element)
     */
    function isElementOffDocument(el) {
        const rect = getAbsoluteRect(el);
        return rect.right < 0 || rect.left > document.documentElement.scrollWidth || rect.bottom < 0 || rect.top > document.documentElement.scrollHeight;
    }

    /**
     * If the point is inside the element returns its distances from the sides, otherwise returns null
     * @param {Point} point
     * @param {HTMLElement} el
     * @return {null|{top: number, left: number, bottom: number, right: number}}
     */
    function calcInnerDistancesBetweenPointAndSidesOfElement(point, el) {
        const rect = getAbsoluteRect(el);
        if (!isPointInsideRect(point, rect)) {
            return null;
        }
        return {
            top: point.y - rect.top,
            bottom: rect.bottom - point.y,
            left: point.x - rect.left,
            // TODO - figure out what is so special about right (why the rect is too big)
            right: Math.min(rect.right, document.documentElement.clientWidth) - point.x
        };
    }

    /**
     * @typedef {Object} Index
     * @property {number} index - the would be index
     * @property {boolean} isProximityBased - false if the element is actually over the index, true if it is not over it but this index is the closest
     */
    /**
     * Find the index for the dragged element in the list it is dragged over
     * @param {HTMLElement} floatingAboveEl
     * @param {HTMLElement} collectionBelowEl
     * @returns {Index|null} -  if the element is over the container the Index object otherwise null
     */
    function findWouldBeIndex(floatingAboveEl, collectionBelowEl) {
        if (!isCenterOfAInsideB(floatingAboveEl, collectionBelowEl)) {
            return null;
        }
        const children = collectionBelowEl.children;
        // the container is empty, floating element should be the first
        if (children.length === 0) {
            return {index: 0, isProximityBased: true};
        }
        // the search could be more efficient but keeping it simple for now
        // a possible improvement: pass in the lastIndex it was found in and check there first, then expand from there
        for (let i = 0; i < children.length; i++) {
            if (isCenterOfAInsideB(floatingAboveEl, children[i])) {
                return {index: i, isProximityBased: false};
            }
        }
        // this can happen if there is space around the children so the floating element has
        //entered the container but not any of the children, in this case we will find the nearest child
        let minDistanceSoFar = Number.MAX_VALUE;
        let indexOfMin = undefined;
        // we are checking all of them because we don't know whether we are dealing with a horizontal or vertical container and where the floating element entered from
        for (let i = 0; i < children.length; i++) {
            const distance = calcDistanceBetweenCenters(floatingAboveEl, children[i]);
            if (distance < minDistanceSoFar) {
                minDistanceSoFar = distance;
                indexOfMin = i;
            }
        }
        return {index: indexOfMin, isProximityBased: true};
    }

    const SCROLL_ZONE_PX = 25;

    function makeScroller() {
        let scrollingInfo;
        function resetScrolling() {
            scrollingInfo = {directionObj: undefined, stepPx: 0};
        }
        resetScrolling();
        // directionObj {x: 0|1|-1, y:0|1|-1} - 1 means down in y and right in x
        function scrollContainer(containerEl) {
            const {directionObj, stepPx} = scrollingInfo;
            if (directionObj) {
                containerEl.scrollBy(directionObj.x * stepPx, directionObj.y * stepPx);
                window.requestAnimationFrame(() => scrollContainer(containerEl));
            }
        }
        function calcScrollStepPx(distancePx) {
            return SCROLL_ZONE_PX - distancePx;
        }

        /**
         * If the pointer is next to the sides of the element to scroll, will trigger scrolling
         * Can be called repeatedly with updated pointer and elementToScroll values without issues
         * @return {boolean} - true if scrolling was needed
         */
        function scrollIfNeeded(pointer, elementToScroll) {
            if (!elementToScroll) {
                return false;
            }
            const distances = calcInnerDistancesBetweenPointAndSidesOfElement(pointer, elementToScroll);
            if (distances === null) {
                resetScrolling();
                return false;
            }
            const isAlreadyScrolling = !!scrollingInfo.directionObj;
            let [scrollingVertically, scrollingHorizontally] = [false, false];
            // vertical
            if (elementToScroll.scrollHeight > elementToScroll.clientHeight) {
                if (distances.bottom < SCROLL_ZONE_PX) {
                    scrollingVertically = true;
                    scrollingInfo.directionObj = {x: 0, y: 1};
                    scrollingInfo.stepPx = calcScrollStepPx(distances.bottom);
                } else if (distances.top < SCROLL_ZONE_PX) {
                    scrollingVertically = true;
                    scrollingInfo.directionObj = {x: 0, y: -1};
                    scrollingInfo.stepPx = calcScrollStepPx(distances.top);
                }
                if (!isAlreadyScrolling && scrollingVertically) {
                    scrollContainer(elementToScroll);
                    return true;
                }
            }
            // horizontal
            if (elementToScroll.scrollWidth > elementToScroll.clientWidth) {
                if (distances.right < SCROLL_ZONE_PX) {
                    scrollingHorizontally = true;
                    scrollingInfo.directionObj = {x: 1, y: 0};
                    scrollingInfo.stepPx = calcScrollStepPx(distances.right);
                } else if (distances.left < SCROLL_ZONE_PX) {
                    scrollingHorizontally = true;
                    scrollingInfo.directionObj = {x: -1, y: 0};
                    scrollingInfo.stepPx = calcScrollStepPx(distances.left);
                }
                if (!isAlreadyScrolling && scrollingHorizontally) {
                    scrollContainer(elementToScroll);
                    return true;
                }
            }
            resetScrolling();
            return false;
        }

        return {
            scrollIfNeeded,
            resetScrolling
        };
    }

    /**
     * @param {Object} object
     * @return {string}
     */
    function toString(object) {
        return JSON.stringify(object, null, 2);
    }

    /**
     * Finds the depth of the given node in the DOM tree
     * @param {HTMLElement} node
     * @return {number} - the depth of the node
     */
    function getDepth(node) {
        if (!node) {
            throw new Error("cannot get depth of a falsy node");
        }
        return _getDepth(node, 0);
    }
    function _getDepth(node, countSoFar = 0) {
        if (!node.parentElement) {
            return countSoFar - 1;
        }
        return _getDepth(node.parentElement, countSoFar + 1);
    }

    /**
     * A simple util to shallow compare objects quickly, it doesn't validate the arguments so pass objects in
     * @param {Object} objA
     * @param {Object} objB
     * @return {boolean} - true if objA and objB are shallow equal
     */
    function areObjectsShallowEqual(objA, objB) {
        if (Object.keys(objA).length !== Object.keys(objB).length) {
            return false;
        }
        for (const keyA in objA) {
            if (!{}.hasOwnProperty.call(objB, keyA) || objB[keyA] !== objA[keyA]) {
                return false;
            }
        }
        return true;
    }

    const INTERVAL_MS = 200;
    const TOLERANCE_PX = 10;
    const {scrollIfNeeded, resetScrolling} = makeScroller();
    let next;

    /**
     * Tracks the dragged elements and performs the side effects when it is dragged over a drop zone (basically dispatching custom-events scrolling)
     * @param {Set<HTMLElement>} dropZones
     * @param {HTMLElement} draggedEl
     * @param {number} [intervalMs = INTERVAL_MS]
     */
    function observe(draggedEl, dropZones, intervalMs = INTERVAL_MS) {
        // initialization
        let lastDropZoneFound;
        let lastIndexFound;
        let lastIsDraggedInADropZone = false;
        let lastCentrePositionOfDragged;
        // We are sorting to make sure that in case of nested zones of the same type the one "on top" is considered first
        const dropZonesFromDeepToShallow = Array.from(dropZones).sort((dz1, dz2) => getDepth(dz2) - getDepth(dz1));

        /**
         * The main function in this module. Tracks where everything is/ should be a take the actions
         */
        function andNow() {
            const currentCenterOfDragged = findCenterOfElement(draggedEl);
            const scrolled = scrollIfNeeded(currentCenterOfDragged, lastDropZoneFound);
            // we only want to make a new decision after the element was moved a bit to prevent flickering
            if (
                !scrolled &&
                lastCentrePositionOfDragged &&
                Math.abs(lastCentrePositionOfDragged.x - currentCenterOfDragged.x) < TOLERANCE_PX &&
                Math.abs(lastCentrePositionOfDragged.y - currentCenterOfDragged.y) < TOLERANCE_PX
            ) {
                next = window.setTimeout(andNow, intervalMs);
                return;
            }
            if (isElementOffDocument(draggedEl)) {
                dispatchDraggedLeftDocument(draggedEl);
                return;
            }

            lastCentrePositionOfDragged = currentCenterOfDragged;
            // this is a simple algorithm, potential improvement: first look at lastDropZoneFound
            let isDraggedInADropZone = false;
            for (const dz of dropZonesFromDeepToShallow) {
                const indexObj = findWouldBeIndex(draggedEl, dz);
                if (indexObj === null) {
                    // it is not inside
                    continue;
                }
                const {index} = indexObj;
                isDraggedInADropZone = true;
                // the element is over a container
                if (dz !== lastDropZoneFound) {
                    lastDropZoneFound && dispatchDraggedElementLeftContainer(lastDropZoneFound, draggedEl);
                    dispatchDraggedElementEnteredContainer(dz, indexObj, draggedEl);
                    lastDropZoneFound = dz;
                    lastIndexFound = index;
                } else if (index !== lastIndexFound) {
                    dispatchDraggedElementIsOverIndex(dz, indexObj, draggedEl);
                    lastIndexFound = index;
                }
                // we handle looping with the 'continue' statement above
                break;
            }
            // the first time the dragged element is not in any dropzone we need to notify the last dropzone it was in
            if (!isDraggedInADropZone && lastIsDraggedInADropZone && lastDropZoneFound) {
                dispatchDraggedElementLeftContainer(lastDropZoneFound, draggedEl);
                lastDropZoneFound = undefined;
                lastIndexFound = undefined;
                lastIsDraggedInADropZone = false;
            } else {
                lastIsDraggedInADropZone = true;
            }
            next = window.setTimeout(andNow, intervalMs);
        }
        andNow();
    }

    // assumption - we can only observe one dragged element at a time, this could be changed in the future
    function unobserve() {
        clearTimeout(next);
        resetScrolling();
    }

    const INTERVAL_MS$1 = 300;
    let mousePosition;

    /**
     * Do not use this! it is visible for testing only until we get over the issue Cypress not triggering the mousemove listeners
     * // TODO - make private (remove export)
     * @param {{clientX: number, clientY: number}} e
     */
    function updateMousePosition(e) {
        const c = e.touches ? e.touches[0] : e;
        mousePosition = {x: c.clientX, y: c.clientY};
    }
    const {scrollIfNeeded: scrollIfNeeded$1, resetScrolling: resetScrolling$1} = makeScroller();
    let next$1;

    function loop$1() {
        if (mousePosition) {
            scrollIfNeeded$1(mousePosition, document.documentElement);
        }
        next$1 = window.setTimeout(loop$1, INTERVAL_MS$1);
    }

    /**
     * will start watching the mouse pointer and scroll the window if it goes next to the edges
     */
    function armWindowScroller() {
        window.addEventListener("mousemove", updateMousePosition);
        window.addEventListener("touchmove", updateMousePosition);
        loop$1();
    }

    /**
     * will stop watching the mouse pointer and won't scroll the window anymore
     */
    function disarmWindowScroller() {
        window.removeEventListener("mousemove", updateMousePosition);
        window.removeEventListener("touchmove", updateMousePosition);
        mousePosition = undefined;
        window.clearTimeout(next$1);
        resetScrolling$1();
    }

    const TRANSITION_DURATION_SECONDS = 0.2;

    /**
     * private helper function - creates a transition string for a property
     * @param {string} property
     * @return {string} - the transition string
     */
    function trs(property) {
        return `${property} ${TRANSITION_DURATION_SECONDS}s ease`;
    }
    /**
     * clones the given element and applies proper styles and transitions to the dragged element
     * @param {HTMLElement} originalElement
     * @return {Node} - the cloned, styled element
     */
    function createDraggedElementFrom(originalElement) {
        const rect = originalElement.getBoundingClientRect();
        const draggedEl = originalElement.cloneNode(true);
        copyStylesFromTo(originalElement, draggedEl);
        draggedEl.id = `dnd-action-dragged-el`;
        draggedEl.style.position = "fixed";
        draggedEl.style.top = `${rect.top}px`;
        draggedEl.style.left = `${rect.left}px`;
        draggedEl.style.margin = "0";
        // we can't have relative or automatic height and width or it will break the illusion
        draggedEl.style.boxSizing = "border-box";
        draggedEl.style.height = `${rect.height}px`;
        draggedEl.style.width = `${rect.width}px`;
        draggedEl.style.transition = `${trs("width")}, ${trs("height")}, ${trs("background-color")}, ${trs("opacity")}, ${trs("color")} `;
        // this is a workaround for a strange browser bug that causes the right border to disappear when all the transitions are added at the same time
        window.setTimeout(() => (draggedEl.style.transition += `, ${trs("top")}, ${trs("left")}`), 0);
        draggedEl.style.zIndex = "9999";
        draggedEl.style.cursor = "grabbing";

        return draggedEl;
    }

    /**
     * styles the dragged element to a 'dropped' state
     * @param {HTMLElement} draggedEl
     */
    function moveDraggedElementToWasDroppedState(draggedEl) {
        draggedEl.style.cursor = "grab";
    }

    /**
     * Morphs the dragged element style, maintains the mouse pointer within the element
     * @param {HTMLElement} draggedEl
     * @param {HTMLElement} copyFromEl - the element the dragged element should look like, typically the shadow element
     * @param {number} currentMouseX
     * @param {number} currentMouseY
     * @param {function} transformDraggedElement - function to transform the dragged element, does nothing by default.
     */
    function morphDraggedElementToBeLike(draggedEl, copyFromEl, currentMouseX, currentMouseY, transformDraggedElement) {
        const newRect = copyFromEl.getBoundingClientRect();
        const draggedElRect = draggedEl.getBoundingClientRect();
        const widthChange = newRect.width - draggedElRect.width;
        const heightChange = newRect.height - draggedElRect.height;
        if (widthChange || heightChange) {
            const relativeDistanceOfMousePointerFromDraggedSides = {
                left: (currentMouseX - draggedElRect.left) / draggedElRect.width,
                top: (currentMouseY - draggedElRect.top) / draggedElRect.height
            };
            draggedEl.style.height = `${newRect.height}px`;
            draggedEl.style.width = `${newRect.width}px`;
            draggedEl.style.left = `${parseFloat(draggedEl.style.left) - relativeDistanceOfMousePointerFromDraggedSides.left * widthChange}px`;
            draggedEl.style.top = `${parseFloat(draggedEl.style.top) - relativeDistanceOfMousePointerFromDraggedSides.top * heightChange}px`;
        }

        /// other properties
        copyStylesFromTo(copyFromEl, draggedEl);
        transformDraggedElement();
    }

    /**
     *
     * @param {HTMLElement} copyFromEl
     * @param {HTMLElement} copyToEl
     */
    function copyStylesFromTo(copyFromEl, copyToEl) {
        const computedStyle = window.getComputedStyle(copyFromEl);
        Array.from(computedStyle)
            .filter(
                s =>
                    s.startsWith("background") ||
                    s.startsWith("padding") ||
                    s.startsWith("font") ||
                    s.startsWith("text") ||
                    s.startsWith("align") ||
                    s.startsWith("justify") ||
                    s.startsWith("display") ||
                    s.startsWith("flex") ||
                    s.startsWith("border") ||
                    s === "opacity" ||
                    s === "color" ||
                    s === "list-style-type"
            )
            .forEach(s => copyToEl.style.setProperty(s, computedStyle.getPropertyValue(s), computedStyle.getPropertyPriority(s)));
    }

    /**
     * makes the element compatible with being draggable
     * @param {HTMLElement} draggableEl
     * @param {boolean} dragDisabled
     */
    function styleDraggable(draggableEl, dragDisabled) {
        draggableEl.draggable = false;
        draggableEl.ondragstart = () => false;
        if (!dragDisabled) {
            draggableEl.style.userSelect = "none";
            draggableEl.style.WebkitUserSelect = "none";
            draggableEl.style.cursor = "grab";
        } else {
            draggableEl.style.userSelect = "";
            draggableEl.style.WebkitUserSelect = "";
            draggableEl.style.cursor = "";
        }
    }

    /**
     * Hides the provided element so that it can stay in the dom without interrupting
     * @param {HTMLElement} dragTarget
     */
    function hideOriginalDragTarget(dragTarget) {
        dragTarget.style.display = "none";
        dragTarget.style.position = "fixed";
        dragTarget.style.zIndex = "-5";
    }

    /**
     * styles the shadow element
     * @param {HTMLElement} shadowEl
     */
    function styleShadowEl(shadowEl) {
        shadowEl.style.visibility = "hidden";
    }

    /**
     * will mark the given dropzones as visually active
     * @param {Array<HTMLElement>} dropZones
     * @param {Function} getStyles - maps a dropzone to a styles object (so the styles can be removed)
     */
    function styleActiveDropZones(dropZones, getStyles = () => {}) {
        dropZones.forEach(dz => {
            const styles = getStyles(dz);
            Object.keys(styles).forEach(style => {
                dz.style[style] = styles[style];
            });
        });
    }

    /**
     * will remove the 'active' styling from given dropzones
     * @param {Array<HTMLElement>} dropZones
     * @param {Function} getStyles - maps a dropzone to a styles object
     */
    function styleInactiveDropZones(dropZones, getStyles = () => {}) {
        dropZones.forEach(dz => {
            const styles = getStyles(dz);
            Object.keys(styles).forEach(style => {
                dz.style[style] = "";
            });
        });
    }

    const DEFAULT_DROP_ZONE_TYPE = "--any--";
    const MIN_OBSERVATION_INTERVAL_MS = 100;
    const MIN_MOVEMENT_BEFORE_DRAG_START_PX = 3;
    const DEFAULT_DROP_TARGET_STYLE = {
        outline: "rgba(255, 255, 102, 0.7) solid 2px"
    };

    let originalDragTarget;
    let draggedEl;
    let draggedElData;
    let draggedElType;
    let originDropZone;
    let originIndex;
    let shadowElData;
    let shadowElDropZone;
    let dragStartMousePosition;
    let currentMousePosition;
    let isWorkingOnPreviousDrag = false;
    let finalizingPreviousDrag = false;

    // a map from type to a set of drop-zones
    const typeToDropZones = new Map();
    // important - this is needed because otherwise the config that would be used for everyone is the config of the element that created the event listeners
    const dzToConfig = new Map();
    // this is needed in order to be able to cleanup old listeners and avoid stale closures issues (as the listener is defined within each zone)
    const elToMouseDownListener = new WeakMap();

    /* drop-zones registration management */
    function registerDropZone(dropZoneEl, type) {
        if (!typeToDropZones.has(type)) {
            typeToDropZones.set(type, new Set());
        }
        if (!typeToDropZones.get(type).has(dropZoneEl)) {
            typeToDropZones.get(type).add(dropZoneEl);
            incrementActiveDropZoneCount();
        }
    }
    function unregisterDropZone(dropZoneEl, type) {
        typeToDropZones.get(type).delete(dropZoneEl);
        decrementActiveDropZoneCount();
        if (typeToDropZones.get(type).size === 0) {
            typeToDropZones.delete(type);
        }
    }

    /* functions to manage observing the dragged element and trigger custom drag-events */
    function watchDraggedElement() {
        armWindowScroller();
        const dropZones = typeToDropZones.get(draggedElType);
        for (const dz of dropZones) {
            dz.addEventListener(DRAGGED_ENTERED_EVENT_NAME, handleDraggedEntered);
            dz.addEventListener(DRAGGED_LEFT_EVENT_NAME, handleDraggedLeft);
            dz.addEventListener(DRAGGED_OVER_INDEX_EVENT_NAME, handleDraggedIsOverIndex);
        }
        window.addEventListener(DRAGGED_LEFT_DOCUMENT_EVENT_NAME, handleDrop);
        // it is important that we don't have an interval that is faster than the flip duration because it can cause elements to jump bach and forth
        const observationIntervalMs = Math.max(
            MIN_OBSERVATION_INTERVAL_MS,
            ...Array.from(dropZones.keys()).map(dz => dzToConfig.get(dz).dropAnimationDurationMs)
        );
        observe(draggedEl, dropZones, observationIntervalMs * 1.07);
    }
    function unWatchDraggedElement() {
        disarmWindowScroller();
        const dropZones = typeToDropZones.get(draggedElType);
        for (const dz of dropZones) {
            dz.removeEventListener(DRAGGED_ENTERED_EVENT_NAME, handleDraggedEntered);
            dz.removeEventListener(DRAGGED_LEFT_EVENT_NAME, handleDraggedLeft);
            dz.removeEventListener(DRAGGED_OVER_INDEX_EVENT_NAME, handleDraggedIsOverIndex);
        }
        window.removeEventListener(DRAGGED_LEFT_DOCUMENT_EVENT_NAME, handleDrop);
        unobserve();
    }

    /* custom drag-events handlers */
    function handleDraggedEntered(e) {
        let {items, dropFromOthersDisabled} = dzToConfig.get(e.currentTarget);
        if (dropFromOthersDisabled && e.currentTarget !== originDropZone) {
            return;
        }
        // this deals with another race condition. in rare occasions (super rapid operations) the list hasn't updated yet
        items = items.filter(i => i[ITEM_ID_KEY] !== shadowElData[ITEM_ID_KEY]);
        const {index, isProximityBased} = e.detail.indexObj;
        const shadowElIdx = isProximityBased && index === e.currentTarget.children.length - 1 ? index + 1 : index;
        shadowElDropZone = e.currentTarget;
        items.splice(shadowElIdx, 0, shadowElData);
        dispatchConsiderEvent(e.currentTarget, items, {trigger: TRIGGERS.DRAGGED_ENTERED, id: draggedElData[ITEM_ID_KEY], source: SOURCES.POINTER});
    }
    function handleDraggedLeft(e) {
        const {items, dropFromOthersDisabled} = dzToConfig.get(e.currentTarget);
        if (dropFromOthersDisabled && e.currentTarget !== originDropZone) {
            return;
        }
        const shadowElIdx = items.findIndex(item => !!item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
        items.splice(shadowElIdx, 1);
        shadowElDropZone = undefined;
        dispatchConsiderEvent(e.currentTarget, items, {trigger: TRIGGERS.DRAGGED_LEFT, id: draggedElData[ITEM_ID_KEY], source: SOURCES.POINTER});
    }
    function handleDraggedIsOverIndex(e) {
        const {items, dropFromOthersDisabled} = dzToConfig.get(e.currentTarget);
        if (dropFromOthersDisabled && e.currentTarget !== originDropZone) {
            return;
        }
        const {index} = e.detail.indexObj;
        const shadowElIdx = items.findIndex(item => !!item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
        items.splice(shadowElIdx, 1);
        items.splice(index, 0, shadowElData);
        dispatchConsiderEvent(e.currentTarget, items, {trigger: TRIGGERS.DRAGGED_OVER_INDEX, id: draggedElData[ITEM_ID_KEY], source: SOURCES.POINTER});
    }

    // Global mouse/touch-events handlers
    function handleMouseMove(e) {
        e.preventDefault();
        const c = e.touches ? e.touches[0] : e;
        currentMousePosition = {x: c.clientX, y: c.clientY};
        draggedEl.style.transform = `translate3d(${currentMousePosition.x - dragStartMousePosition.x}px, ${
        currentMousePosition.y - dragStartMousePosition.y
    }px, 0)`;
    }

    function handleDrop() {
        finalizingPreviousDrag = true;
        // cleanup
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("touchmove", handleMouseMove);
        window.removeEventListener("mouseup", handleDrop);
        window.removeEventListener("touchend", handleDrop);
        unWatchDraggedElement();
        moveDraggedElementToWasDroppedState(draggedEl);
        let finalizeFunction;
        if (shadowElDropZone) {
            let {items, type} = dzToConfig.get(shadowElDropZone);
            styleInactiveDropZones(typeToDropZones.get(type), dz => dzToConfig.get(dz).dropTargetStyle);
            let shadowElIdx = items.findIndex(item => !!item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
            // the handler might remove the shadow element, ex: dragula like copy on drag
            if (shadowElIdx === -1) shadowElIdx = originIndex;
            items = items.map(item => (item[SHADOW_ITEM_MARKER_PROPERTY_NAME] ? draggedElData : item));
            finalizeFunction = function finalizeWithinZone() {
                dispatchFinalizeEvent(shadowElDropZone, items, {
                    trigger: TRIGGERS.DROPPED_INTO_ZONE,
                    id: draggedElData[ITEM_ID_KEY],
                    source: SOURCES.POINTER
                });
                if (shadowElDropZone !== originDropZone) {
                    // letting the origin drop zone know the element was permanently taken away
                    dispatchFinalizeEvent(originDropZone, dzToConfig.get(originDropZone).items, {
                        trigger: TRIGGERS.DROPPED_INTO_ANOTHER,
                        id: draggedElData[ITEM_ID_KEY],
                        source: SOURCES.POINTER
                    });
                }
                shadowElDropZone.children[shadowElIdx].style.visibility = "";
                cleanupPostDrop();
            };
            animateDraggedToFinalPosition(shadowElIdx, finalizeFunction);
        } else {
            let {items, type} = dzToConfig.get(originDropZone);
            styleInactiveDropZones(typeToDropZones.get(type), dz => dzToConfig.get(dz).dropTargetStyle);
            items.splice(originIndex, 0, shadowElData);
            shadowElDropZone = originDropZone;
            dispatchConsiderEvent(originDropZone, items, {
                trigger: TRIGGERS.DROPPED_OUTSIDE_OF_ANY,
                id: draggedElData[ITEM_ID_KEY],
                source: SOURCES.POINTER
            });
            finalizeFunction = function finalizeBackToOrigin() {
                const finalItems = [...items];
                finalItems.splice(originIndex, 1, draggedElData);
                dispatchFinalizeEvent(originDropZone, finalItems, {
                    trigger: TRIGGERS.DROPPED_OUTSIDE_OF_ANY,
                    id: draggedElData[ITEM_ID_KEY],
                    source: SOURCES.POINTER
                });
                shadowElDropZone.children[originIndex].style.visibility = "";
                cleanupPostDrop();
            };
            window.setTimeout(() => animateDraggedToFinalPosition(originIndex, finalizeFunction), 0);
        }
    }

    // helper function for handleDrop
    function animateDraggedToFinalPosition(shadowElIdx, callback) {
        const shadowElRect = shadowElDropZone.children[shadowElIdx].getBoundingClientRect();
        const newTransform = {
            x: shadowElRect.left - parseFloat(draggedEl.style.left),
            y: shadowElRect.top - parseFloat(draggedEl.style.top)
        };
        const {dropAnimationDurationMs} = dzToConfig.get(shadowElDropZone);
        const transition = `transform ${dropAnimationDurationMs}ms ease`;
        draggedEl.style.transition = draggedEl.style.transition ? draggedEl.style.transition + "," + transition : transition;
        draggedEl.style.transform = `translate3d(${newTransform.x}px, ${newTransform.y}px, 0)`;
        window.setTimeout(callback, dropAnimationDurationMs);
    }

    /* cleanup */
    function cleanupPostDrop() {
        draggedEl.remove();
        originalDragTarget.remove();
        draggedEl = undefined;
        originalDragTarget = undefined;
        draggedElData = undefined;
        draggedElType = undefined;
        originDropZone = undefined;
        originIndex = undefined;
        shadowElData = undefined;
        shadowElDropZone = undefined;
        dragStartMousePosition = undefined;
        currentMousePosition = undefined;
        isWorkingOnPreviousDrag = false;
        finalizingPreviousDrag = false;
    }

    function dndzone(node, options) {
        const config = {
            items: undefined,
            type: undefined,
            flipDurationMs: 0,
            dragDisabled: false,
            dropFromOthersDisabled: false,
            dropTargetStyle: DEFAULT_DROP_TARGET_STYLE,
            transformDraggedElement: () => {}
        };
        let elToIdx = new Map();

        function addMaybeListeners() {
            window.addEventListener("mousemove", handleMouseMoveMaybeDragStart, {passive: false});
            window.addEventListener("touchmove", handleMouseMoveMaybeDragStart, {passive: false, capture: false});
            window.addEventListener("mouseup", handleFalseAlarm, {passive: false});
            window.addEventListener("touchend", handleFalseAlarm, {passive: false});
        }
        function removeMaybeListeners() {
            window.removeEventListener("mousemove", handleMouseMoveMaybeDragStart);
            window.removeEventListener("touchmove", handleMouseMoveMaybeDragStart);
            window.removeEventListener("mouseup", handleFalseAlarm);
            window.removeEventListener("touchend", handleFalseAlarm);
        }
        function handleFalseAlarm() {
            removeMaybeListeners();
            originalDragTarget = undefined;
            dragStartMousePosition = undefined;
            currentMousePosition = undefined;
        }

        function handleMouseMoveMaybeDragStart(e) {
            e.preventDefault();
            const c = e.touches ? e.touches[0] : e;
            currentMousePosition = {x: c.clientX, y: c.clientY};
            if (
                Math.abs(currentMousePosition.x - dragStartMousePosition.x) >= MIN_MOVEMENT_BEFORE_DRAG_START_PX ||
                Math.abs(currentMousePosition.y - dragStartMousePosition.y) >= MIN_MOVEMENT_BEFORE_DRAG_START_PX
            ) {
                removeMaybeListeners();
                handleDragStart();
            }
        }
        function handleMouseDown(e) {
            // prevents responding to any button but left click which equals 0 (which is falsy)
            if (e.button) {
                return;
            }
            if (isWorkingOnPreviousDrag) {
                return;
            }
            e.stopPropagation();
            const c = e.touches ? e.touches[0] : e;
            dragStartMousePosition = {x: c.clientX, y: c.clientY};
            currentMousePosition = {...dragStartMousePosition};
            originalDragTarget = e.currentTarget;
            addMaybeListeners();
        }

        function handleDragStart() {
            isWorkingOnPreviousDrag = true;

            // initialising globals
            const currentIdx = elToIdx.get(originalDragTarget);
            originIndex = currentIdx;
            originDropZone = originalDragTarget.parentElement;
            const {items, type} = config;
            draggedElData = {...items[currentIdx]};
            draggedElType = type;
            shadowElData = {...draggedElData, [SHADOW_ITEM_MARKER_PROPERTY_NAME]: true};

            // creating the draggable element
            draggedEl = createDraggedElementFrom(originalDragTarget);
            // We will keep the original dom node in the dom because touch events keep firing on it, we want to re-add it after the framework removes it
            function keepOriginalElementInDom() {
                const {items: itemsNow} = config;
                if (!draggedEl.parentElement && (!itemsNow[originIndex] || draggedElData[ITEM_ID_KEY] !== itemsNow[originIndex][ITEM_ID_KEY])) {
                    document.body.appendChild(draggedEl);
                    // to prevent the outline from disappearing
                    draggedEl.focus();
                    watchDraggedElement();
                    hideOriginalDragTarget(originalDragTarget);
                    document.body.appendChild(originalDragTarget);
                } else {
                    window.requestAnimationFrame(keepOriginalElementInDom);
                }
            }
            window.requestAnimationFrame(keepOriginalElementInDom);

            styleActiveDropZones(
                Array.from(typeToDropZones.get(config.type)).filter(dz => dz === originDropZone || !dzToConfig.get(dz).dropFromOthersDisabled),
                dz => dzToConfig.get(dz).dropTargetStyle
            );

            // removing the original element by removing its data entry
            items.splice(currentIdx, 1);
            dispatchConsiderEvent(originDropZone, items, {trigger: TRIGGERS.DRAG_STARTED, id: draggedElData[ITEM_ID_KEY], source: SOURCES.POINTER});

            // handing over to global handlers - starting to watch the element
            window.addEventListener("mousemove", handleMouseMove, {passive: false});
            window.addEventListener("touchmove", handleMouseMove, {passive: false, capture: false});
            window.addEventListener("mouseup", handleDrop, {passive: false});
            window.addEventListener("touchend", handleDrop, {passive: false});
        }

        function configure({
            items = undefined,
            flipDurationMs: dropAnimationDurationMs = 0,
            type: newType = DEFAULT_DROP_ZONE_TYPE,
            dragDisabled = false,
            dropFromOthersDisabled = false,
            dropTargetStyle = DEFAULT_DROP_TARGET_STYLE,
            transformDraggedElement = () => {}
        }) {
            config.dropAnimationDurationMs = dropAnimationDurationMs;
            if (config.type && newType !== config.type) {
                unregisterDropZone(node, config.type);
            }
            config.type = newType;
            registerDropZone(node, newType);

            config.items = [...items];
            config.dragDisabled = dragDisabled;
            config.transformDraggedElement = transformDraggedElement;

            // realtime update for dropTargetStyle
            if (isWorkingOnPreviousDrag && !finalizingPreviousDrag && !areObjectsShallowEqual(dropTargetStyle, config.dropTargetStyle)) {
                styleInactiveDropZones([node], () => config.dropTargetStyle);
                styleActiveDropZones([node], () => dropTargetStyle);
            }
            config.dropTargetStyle = dropTargetStyle;

            // realtime update for dropFromOthersDisabled
            if (isWorkingOnPreviousDrag && config.dropFromOthersDisabled !== dropFromOthersDisabled) {
                if (dropFromOthersDisabled) {
                    styleInactiveDropZones([node], dz => dzToConfig.get(dz).dropTargetStyle);
                } else {
                    styleActiveDropZones([node], dz => dzToConfig.get(dz).dropTargetStyle);
                }
            }
            config.dropFromOthersDisabled = dropFromOthersDisabled;

            dzToConfig.set(node, config);
            for (let idx = 0; idx < node.children.length; idx++) {
                const draggableEl = node.children[idx];
                styleDraggable(draggableEl, dragDisabled);
                if (config.items[idx][SHADOW_ITEM_MARKER_PROPERTY_NAME]) {
                    morphDraggedElementToBeLike(draggedEl, draggableEl, currentMousePosition.x, currentMousePosition.y, () =>
                        config.transformDraggedElement(draggedEl, draggedElData, idx)
                    );
                    styleShadowEl(draggableEl);
                    continue;
                }
                draggableEl.removeEventListener("mousedown", elToMouseDownListener.get(draggableEl));
                draggableEl.removeEventListener("touchstart", elToMouseDownListener.get(draggableEl));
                if (!dragDisabled) {
                    draggableEl.addEventListener("mousedown", handleMouseDown);
                    draggableEl.addEventListener("touchstart", handleMouseDown);
                    elToMouseDownListener.set(draggableEl, handleMouseDown);
                }
                // updating the idx
                elToIdx.set(draggableEl, idx);
            }
        }
        configure(options);

        return {
            update: newOptions => {
                configure(newOptions);
            },
            destroy: () => {
                unregisterDropZone(node, config.type);
                dzToConfig.delete(node);
            }
        };
    }

    const INSTRUCTION_IDs = {
        DND_ZONE_ACTIVE: "dnd-zone-active",
        DND_ZONE_DRAG_DISABLED: "dnd-zone-drag-disabled"
    };
    const ID_TO_INSTRUCTION = {
        [INSTRUCTION_IDs.DND_ZONE_ACTIVE]: "Tab to one the items and press space-bar or enter to start dragging it",
        [INSTRUCTION_IDs.DND_ZONE_DRAG_DISABLED]: "This is a disabled drag and drop list"
    };

    const ALERT_DIV_ID = "dnd-action-aria-alert";
    let alertsDiv;
    /**
     * Initializes the static aria instructions so they can be attached to zones
     * @return {{DND_ZONE_ACTIVE: string, DND_ZONE_DRAG_DISABLED: string} | null} - the IDs for static aria instruction (to be used via aria-describedby) or null on the server
     */
    function initAria() {
        if (isOnServer) return null;

        // setting the dynamic alerts
        alertsDiv = document.createElement("div");
        (function initAlertsDiv() {
            alertsDiv.id = ALERT_DIV_ID;
            // tab index -1 makes the alert be read twice on chrome for some reason
            //alertsDiv.tabIndex = -1;
            alertsDiv.style.position = "fixed";
            alertsDiv.style.bottom = "0";
            alertsDiv.style.left = "0";
            alertsDiv.style.zIndex = "-5";
            alertsDiv.style.opacity = "0";
            alertsDiv.style.height = "0";
            alertsDiv.style.width = "0";
            alertsDiv.setAttribute("role", "alert");
        })();
        document.body.prepend(alertsDiv);

        // setting the instructions
        Object.entries(ID_TO_INSTRUCTION).forEach(([id, txt]) => document.body.prepend(instructionToHiddenDiv(id, txt)));
        return {...INSTRUCTION_IDs};
    }
    function instructionToHiddenDiv(id, txt) {
        const div = document.createElement("div");
        div.id = id;
        div.innerHTML = `<p>${txt}</p>`;
        div.style.display = "none";
        div.style.position = "fixed";
        div.style.zIndex = "-5";
        return div;
    }

    /**
     * Will make the screen reader alert the provided text to the user
     * @param {string} txt
     */
    function alertToScreenReader(txt) {
        alertsDiv.innerHTML = "";
        const alertText = document.createTextNode(txt);
        alertsDiv.appendChild(alertText);
        // this is needed for Safari
        alertsDiv.style.display = "none";
        alertsDiv.style.display = "inline";
    }

    const DEFAULT_DROP_ZONE_TYPE$1 = "--any--";
    const DEFAULT_DROP_TARGET_STYLE$1 = {
        outline: "rgba(255, 255, 102, 0.7) solid 2px"
    };

    let isDragging = false;
    let draggedItemType;
    let focusedDz;
    let focusedDzLabel = "";
    let focusedItem;
    let focusedItemId;
    let focusedItemLabel = "";
    const allDragTargets = new WeakSet();
    const elToKeyDownListeners = new WeakMap();
    const elToFocusListeners = new WeakMap();
    const dzToHandles = new Map();
    const dzToConfig$1 = new Map();
    const typeToDropZones$1 = new Map();

    /* TODO (potentially)
     * what's the deal with the black border of voice-reader not following focus?
     * maybe keep focus on the last dragged item upon drop?
     */

    const INSTRUCTION_IDs$1 = initAria();

    /* drop-zones registration management */
    function registerDropZone$1(dropZoneEl, type) {
        if (typeToDropZones$1.size === 0) {
            window.addEventListener("keydown", globalKeyDownHandler);
            window.addEventListener("click", globalClickHandler);
        }
        if (!typeToDropZones$1.has(type)) {
            typeToDropZones$1.set(type, new Set());
        }
        if (!typeToDropZones$1.get(type).has(dropZoneEl)) {
            typeToDropZones$1.get(type).add(dropZoneEl);
            incrementActiveDropZoneCount();
        }
    }
    function unregisterDropZone$1(dropZoneEl, type) {
        typeToDropZones$1.get(type).delete(dropZoneEl);
        decrementActiveDropZoneCount();
        if (typeToDropZones$1.get(type).size === 0) {
            typeToDropZones$1.delete(type);
        }
        if (typeToDropZones$1.size === 0) {
            window.removeEventListener("keydown", globalKeyDownHandler);
            window.removeEventListener("click", globalClickHandler);
        }
    }

    function globalKeyDownHandler(e) {
        if (!isDragging) return;
        switch (e.key) {
            case "Escape": {
                handleDrop$1();
                break;
            }
        }
    }

    function globalClickHandler() {
        if (!isDragging) return;
        if (!allDragTargets.has(document.activeElement)) {
            handleDrop$1();
        }
    }

    function handleZoneFocus(e) {
        if (!isDragging) return;
        const newlyFocusedDz = e.currentTarget;
        if (newlyFocusedDz === focusedDz) return;

        focusedDzLabel = newlyFocusedDz.getAttribute("aria-label") || "";
        const {items: originItems} = dzToConfig$1.get(focusedDz);
        const originItem = originItems.find(item => item[ITEM_ID_KEY] === focusedItemId);
        const originIdx = originItems.indexOf(originItem);
        const itemToMove = originItems.splice(originIdx, 1)[0];
        const {items: targetItems, autoAriaDisabled} = dzToConfig$1.get(newlyFocusedDz);
        if (
            newlyFocusedDz.getBoundingClientRect().top < focusedDz.getBoundingClientRect().top ||
            newlyFocusedDz.getBoundingClientRect().left < focusedDz.getBoundingClientRect().left
        ) {
            targetItems.push(itemToMove);
            if (!autoAriaDisabled) {
                alertToScreenReader(`Moved item ${focusedItemLabel} to the end of the list ${focusedDzLabel}`);
            }
        } else {
            targetItems.unshift(itemToMove);
            if (!autoAriaDisabled) {
                alertToScreenReader(`Moved item ${focusedItemLabel} to the beginning of the list ${focusedDzLabel}`);
            }
        }
        const dzFrom = focusedDz;
        dispatchFinalizeEvent(dzFrom, originItems, {trigger: TRIGGERS.DROPPED_INTO_ANOTHER, id: focusedItemId, source: SOURCES.KEYBOARD});
        dispatchFinalizeEvent(newlyFocusedDz, targetItems, {trigger: TRIGGERS.DROPPED_INTO_ZONE, id: focusedItemId, source: SOURCES.KEYBOARD});
        focusedDz = newlyFocusedDz;
    }

    function triggerAllDzsUpdate() {
        dzToHandles.forEach(({update}, dz) => update(dzToConfig$1.get(dz)));
    }

    function handleDrop$1(dispatchConsider = true) {
        if (!dzToConfig$1.get(focusedDz).autoAriaDisabled) {
            alertToScreenReader(`Stopped dragging item ${focusedItemLabel}`);
        }
        if (allDragTargets.has(document.activeElement)) {
            document.activeElement.blur();
        }
        if (dispatchConsider) {
            dispatchConsiderEvent(focusedDz, dzToConfig$1.get(focusedDz).items, {
                trigger: TRIGGERS.DRAG_STOPPED,
                id: focusedItemId,
                source: SOURCES.KEYBOARD
            });
        }
        styleInactiveDropZones(typeToDropZones$1.get(draggedItemType), dz => dzToConfig$1.get(dz).dropTargetStyle);
        focusedItem = null;
        focusedItemId = null;
        focusedItemLabel = "";
        draggedItemType = null;
        focusedDz = null;
        focusedDzLabel = "";
        isDragging = false;
        triggerAllDzsUpdate();
    }
    //////
    function dndzone$1(node, options) {
        const config = {
            items: undefined,
            type: undefined,
            dragDisabled: false,
            dropFromOthersDisabled: false,
            dropTargetStyle: DEFAULT_DROP_TARGET_STYLE$1,
            autoAriaDisabled: false
        };

        function swap(arr, i, j) {
            if (arr.length <= 1) return;
            arr.splice(j, 1, arr.splice(i, 1, arr[j])[0]);
        }

        function handleKeyDown(e) {
            switch (e.key) {
                case "Enter":
                case " ": {
                    // we don't want to affect nested input elements
                    if ((e.target.value !== undefined || e.target.isContentEditable) && !allDragTargets.has(e.target)) {
                        return;
                    }
                    e.preventDefault(); // preventing scrolling on spacebar
                    e.stopPropagation();
                    if (isDragging) {
                        // TODO - should this trigger a drop? only here or in general (as in when hitting space or enter outside of any zone)?
                        handleDrop$1();
                    } else {
                        // drag start
                        handleDragStart(e);
                    }
                    break;
                }
                case "ArrowDown":
                case "ArrowRight": {
                    if (!isDragging) return;
                    e.preventDefault(); // prevent scrolling
                    e.stopPropagation();
                    const {items} = dzToConfig$1.get(node);
                    const children = Array.from(node.children);
                    const idx = children.indexOf(e.currentTarget);
                    if (idx < children.length - 1) {
                        if (!config.autoAriaDisabled) {
                            alertToScreenReader(`Moved item ${focusedItemLabel} to position ${idx + 2} in the list ${focusedDzLabel}`);
                        }
                        swap(items, idx, idx + 1);
                        dispatchFinalizeEvent(node, items, {trigger: TRIGGERS.DROPPED_INTO_ZONE, id: focusedItemId, source: SOURCES.KEYBOARD});
                    }
                    break;
                }
                case "ArrowUp":
                case "ArrowLeft": {
                    if (!isDragging) return;
                    e.preventDefault(); // prevent scrolling
                    e.stopPropagation();
                    const {items} = dzToConfig$1.get(node);
                    const children = Array.from(node.children);
                    const idx = children.indexOf(e.currentTarget);
                    if (idx > 0) {
                        if (!config.autoAriaDisabled) {
                            alertToScreenReader(`Moved item ${focusedItemLabel} to position ${idx} in the list ${focusedDzLabel}`);
                        }
                        swap(items, idx, idx - 1);
                        dispatchFinalizeEvent(node, items, {trigger: TRIGGERS.DROPPED_INTO_ZONE, id: focusedItemId, source: SOURCES.KEYBOARD});
                    }
                    break;
                }
            }
        }
        function handleDragStart(e) {
            if (!config.autoAriaDisabled) {
                alertToScreenReader(
                    `Started dragging item ${focusedItemLabel}. Use the arrow keys to move it within its list ${focusedDzLabel}, or tab to another list in order to move the item into it`
                );
            }
            setCurrentFocusedItem(e.currentTarget);
            focusedDz = node;
            draggedItemType = config.type;
            isDragging = true;
            styleActiveDropZones(
                Array.from(typeToDropZones$1.get(config.type)).filter(dz => dz === focusedDz || !dzToConfig$1.get(dz).dropFromOthersDisabled),
                dz => dzToConfig$1.get(dz).dropTargetStyle
            );
            dispatchConsiderEvent(node, dzToConfig$1.get(node).items, {trigger: TRIGGERS.DRAG_STARTED, id: focusedItemId, source: SOURCES.KEYBOARD});
            triggerAllDzsUpdate();
        }

        function handleClick(e) {
            if (!isDragging) return;
            if (e.currentTarget === focusedItem) return;
            e.stopPropagation();
            handleDrop$1(false);
            handleDragStart(e);
        }
        function setCurrentFocusedItem(draggableEl) {
            const {items} = dzToConfig$1.get(node);
            const children = Array.from(node.children);
            const focusedItemIdx = children.indexOf(draggableEl);
            focusedItem = draggableEl;
            focusedItemId = items[focusedItemIdx][ITEM_ID_KEY];
            focusedItemLabel = children[focusedItemIdx].getAttribute("aria-label") || "";
        }

        function configure({
            items = [],
            type: newType = DEFAULT_DROP_ZONE_TYPE$1,
            dragDisabled = false,
            dropFromOthersDisabled = false,
            dropTargetStyle = DEFAULT_DROP_TARGET_STYLE$1,
            autoAriaDisabled = false
        }) {
            config.items = [...items];
            config.dragDisabled = dragDisabled;
            config.dropFromOthersDisabled = dropFromOthersDisabled;
            config.dropTargetStyle = dropTargetStyle;
            config.autoAriaDisabled = autoAriaDisabled;
            if (!autoAriaDisabled) {
                node.setAttribute("aria-disabled", dragDisabled);
                node.setAttribute("role", "list");
                node.setAttribute("aria-describedby", dragDisabled ? INSTRUCTION_IDs$1.DND_ZONE_DRAG_DISABLED : INSTRUCTION_IDs$1.DND_ZONE_ACTIVE);
            }
            if (config.type && newType !== config.type) {
                unregisterDropZone$1(node, config.type);
            }
            config.type = newType;
            registerDropZone$1(node, newType);
            dzToConfig$1.set(node, config);

            node.tabIndex =
                isDragging &&
                (node === focusedDz ||
                    focusedItem.contains(node) ||
                    config.dropFromOthersDisabled ||
                    (focusedDz && config.type !== dzToConfig$1.get(focusedDz).type))
                    ? -1
                    : 0;
            node.addEventListener("focus", handleZoneFocus);

            for (let i = 0; i < node.children.length; i++) {
                const draggableEl = node.children[i];
                allDragTargets.add(draggableEl);
                draggableEl.tabIndex = isDragging ? -1 : 0;
                if (!autoAriaDisabled) {
                    draggableEl.setAttribute("role", "listitem");
                }
                draggableEl.removeEventListener("keydown", elToKeyDownListeners.get(draggableEl));
                draggableEl.removeEventListener("click", elToFocusListeners.get(draggableEl));
                if (!dragDisabled) {
                    draggableEl.addEventListener("keydown", handleKeyDown);
                    elToKeyDownListeners.set(draggableEl, handleKeyDown);
                    draggableEl.addEventListener("click", handleClick);
                    elToFocusListeners.set(draggableEl, handleClick);
                }
                if (isDragging && config.items[i][ITEM_ID_KEY] === focusedItemId) {
                    // if it is a nested dropzone, it was re-rendered and we need to refresh our pointer
                    focusedItem = draggableEl;
                    // without this the element loses focus if it moves backwards in the list
                    draggableEl.focus();
                }
            }
        }
        configure(options);

        const handles = {
            update: newOptions => {
                configure(newOptions);
            },
            destroy: () => {
                unregisterDropZone$1(node, config.type);
                dzToConfig$1.delete(node);
                dzToHandles.delete(node);
            }
        };
        dzToHandles.set(node, handles);
        return handles;
    }

    /**
     * A custom action to turn any container to a dnd zone and all of its direct children to draggables
     * Supports mouse, touch and keyboard interactions.
     * Dispatches two events that the container is expected to react to by modifying its list of items,
     * which will then feed back in to this action via the update function
     *
     * @typedef {Object} Options
     * @property {Array} items - the list of items that was used to generate the children of the given node (the list used in the #each block
     * @property {string} [type] - the type of the dnd zone. children dragged from here can only be dropped in other zones of the same type, default to a base type
     * @property {number} [flipDurationMs] - if the list animated using flip (recommended), specifies the flip duration such that everything syncs with it without conflict, defaults to zero
     * @property {boolean} [dragDisabled]
     * @property {boolean} [dropFromOthersDisabled]
     * @property {Object} [dropTargetStyle]
     * @property {Function} [transformDraggedElement]
     * @param {HTMLElement} node - the element to enhance
     * @param {Options} options
     * @return {{update: function, destroy: function}}
     */
    function dndzone$2(node, options) {
        validateOptions(options);
        const pointerZone = dndzone(node, options);
        const keyboardZone = dndzone$1(node, options);
        return {
            update: newOptions => {
                validateOptions(newOptions);
                pointerZone.update(newOptions);
                keyboardZone.update(newOptions);
            },
            destroy: () => {
                pointerZone.destroy();
                keyboardZone.destroy();
            }
        };
    }

    function validateOptions(options) {
        /*eslint-disable*/
        const {
            items,
            flipDurationMs,
            type,
            dragDisabled,
            dropFromOthersDisabled,
            dropTargetStyle,
            transformDraggedElement,
            autoAriaDisabled,
            ...rest
        } = options;
        /*eslint-enable*/
        if (Object.keys(rest).length > 0) {
            console.warn(`dndzone will ignore unknown options`, rest);
        }
        if (!items) {
            throw new Error("no 'items' key provided to dndzone");
        }
        const itemWithMissingId = items.find(item => !{}.hasOwnProperty.call(item, ITEM_ID_KEY));
        if (itemWithMissingId) {
            throw new Error(`missing '${ITEM_ID_KEY}' property for item ${toString(itemWithMissingId)}`);
        }
    }

    /* templates\components\Intersector.svelte generated by Svelte v3.30.0 */
    const file$6 = "templates\\components\\Intersector.svelte";
    const get_default_slot_changes = dirty => ({ intersecting: dirty & /*intersecting*/ 1 });
    const get_default_slot_context = ctx => ({ intersecting: /*intersecting*/ ctx[0] });

    function create_fragment$6(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-1hzn8rv");
    			add_location(div, file$6, 31, 0, 946);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[9](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, intersecting*/ 129) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[9](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Intersector", slots, ['default']);
    	let { once = false } = $$props;
    	let { top = 0 } = $$props;
    	let { bottom = 0 } = $$props;
    	let { left = 0 } = $$props;
    	let { right = 0 } = $$props;
    	let intersecting = false;
    	let container;

    	onMount(() => {
    		if (typeof IntersectionObserver !== "undefined") {
    			const rootMargin = `${bottom}px ${left}px ${top}px ${right}px`;

    			const observer = new IntersectionObserver(entries => {
    					$$invalidate(0, intersecting = entries[0].isIntersecting);

    					if (intersecting && once) {
    						observer.unobserve(container);
    					}
    				},
    			{ rootMargin });

    			observer.observe(container);
    			return () => observer.unobserve(container);
    		}
    	});

    	const writable_props = ["once", "top", "bottom", "left", "right"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Intersector> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(1, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("once" in $$props) $$invalidate(2, once = $$props.once);
    		if ("top" in $$props) $$invalidate(3, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(4, bottom = $$props.bottom);
    		if ("left" in $$props) $$invalidate(5, left = $$props.left);
    		if ("right" in $$props) $$invalidate(6, right = $$props.right);
    		if ("$$scope" in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		once,
    		top,
    		bottom,
    		left,
    		right,
    		intersecting,
    		container
    	});

    	$$self.$inject_state = $$props => {
    		if ("once" in $$props) $$invalidate(2, once = $$props.once);
    		if ("top" in $$props) $$invalidate(3, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(4, bottom = $$props.bottom);
    		if ("left" in $$props) $$invalidate(5, left = $$props.left);
    		if ("right" in $$props) $$invalidate(6, right = $$props.right);
    		if ("intersecting" in $$props) $$invalidate(0, intersecting = $$props.intersecting);
    		if ("container" in $$props) $$invalidate(1, container = $$props.container);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		intersecting,
    		container,
    		once,
    		top,
    		bottom,
    		left,
    		right,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Intersector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			once: 2,
    			top: 3,
    			bottom: 4,
    			left: 5,
    			right: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Intersector",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get once() {
    		throw new Error("<Intersector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set once(value) {
    		throw new Error("<Intersector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get top() {
    		throw new Error("<Intersector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Intersector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bottom() {
    		throw new Error("<Intersector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bottom(value) {
    		throw new Error("<Intersector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get left() {
    		throw new Error("<Intersector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set left(value) {
    		throw new Error("<Intersector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<Intersector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<Intersector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* templates\components\GalleryImage.svelte generated by Svelte v3.30.0 */
    const file$7 = "templates\\components\\GalleryImage.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i][0];
    	child_ctx[25] = list[i][1];
    	child_ctx[26] = list[i][2];
    	child_ctx[27] = list[i][3];
    	child_ctx[28] = list[i][4];
    	child_ctx[29] = list[i][5];
    	return child_ctx;
    }

    // (59:4) {#if !loaded}
    function create_if_block$1(ctx) {
    	let div;
    	let svg;
    	let g;
    	let svg_viewBox_value;
    	let div_class_value;
    	let div_outro;
    	let current;
    	let if_block = !/*loaded*/ ctx[1] && create_if_block_1$1(ctx);
    	let each_value = /*svgSequence*/ ctx[7];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(g, file$7, 66, 16, 2320);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*svgWidth*/ ctx[2] + " " + /*svgHeight*/ ctx[8]);
    			attr_dev(svg, "style", /*svgScale*/ ctx[10]);
    			add_location(svg, file$7, 60, 12, 1947);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*photoSvgClass*/ ctx[9]) + " svelte-1lgp88u"));
    			add_location(div, file$7, 59, 8, 1885);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, g);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!/*loaded*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*loaded*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(svg, g);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*svgSequence*/ 128) {
    				each_value = /*svgSequence*/ ctx[7];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty[0] & /*svgWidth, svgHeight*/ 260 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*svgWidth*/ ctx[2] + " " + /*svgHeight*/ ctx[8])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (!current || dirty[0] & /*svgScale*/ 1024) {
    				attr_dev(svg, "style", /*svgScale*/ ctx[10]);
    			}

    			if (!current || dirty[0] & /*photoSvgClass*/ 512 && div_class_value !== (div_class_value = "" + (null_to_empty(/*photoSvgClass*/ ctx[9]) + " svelte-1lgp88u"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			if (div_outro) div_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			div_outro = create_out_transition(div, fade, /*fadeSlow*/ ctx[13]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(59:4) {#if !loaded}",
    		ctx
    	});

    	return block;
    }

    // (63:16) {#if !loaded}
    function create_if_block_1$1(ctx) {
    	let rect;
    	let rect_outro;
    	let current;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", /*svgWidth*/ ctx[2]);
    			attr_dev(rect, "height", /*svgHeight*/ ctx[8]);
    			attr_dev(rect, "fill", "#f0f0f0");
    			add_location(rect, file$7, 63, 20, 2162);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty[0] & /*svgWidth*/ 4) {
    				attr_dev(rect, "width", /*svgWidth*/ ctx[2]);
    			}

    			if (!current || dirty[0] & /*svgHeight*/ 256) {
    				attr_dev(rect, "height", /*svgHeight*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (rect_outro) rect_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			rect_outro = create_out_transition(rect, fade, /*fadeQuick*/ ctx[14]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    			if (detaching && rect_outro) rect_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(63:16) {#if !loaded}",
    		ctx
    	});

    	return block;
    }

    // (68:20) {#each svgSequence as [ fill, opacity, cx, cy, rx, ry ] }
    function create_each_block$1(ctx) {
    	let ellipse;
    	let ellipse_fill_value;
    	let ellipse_fill_opacity_value;
    	let ellipse_cx_value;
    	let ellipse_cy_value;
    	let ellipse_rx_value;
    	let ellipse_ry_value;

    	const block = {
    		c: function create() {
    			ellipse = svg_element("ellipse");
    			attr_dev(ellipse, "fill", ellipse_fill_value = /*fill*/ ctx[24]);
    			attr_dev(ellipse, "fill-opacity", ellipse_fill_opacity_value = /*opacity*/ ctx[25]);
    			attr_dev(ellipse, "cx", ellipse_cx_value = /*cx*/ ctx[26]);
    			attr_dev(ellipse, "cy", ellipse_cy_value = /*cy*/ ctx[27]);
    			attr_dev(ellipse, "rx", ellipse_rx_value = /*rx*/ ctx[28]);
    			attr_dev(ellipse, "ry", ellipse_ry_value = /*ry*/ ctx[29]);
    			add_location(ellipse, file$7, 68, 24, 2428);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ellipse, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*svgSequence*/ 128 && ellipse_fill_value !== (ellipse_fill_value = /*fill*/ ctx[24])) {
    				attr_dev(ellipse, "fill", ellipse_fill_value);
    			}

    			if (dirty[0] & /*svgSequence*/ 128 && ellipse_fill_opacity_value !== (ellipse_fill_opacity_value = /*opacity*/ ctx[25])) {
    				attr_dev(ellipse, "fill-opacity", ellipse_fill_opacity_value);
    			}

    			if (dirty[0] & /*svgSequence*/ 128 && ellipse_cx_value !== (ellipse_cx_value = /*cx*/ ctx[26])) {
    				attr_dev(ellipse, "cx", ellipse_cx_value);
    			}

    			if (dirty[0] & /*svgSequence*/ 128 && ellipse_cy_value !== (ellipse_cy_value = /*cy*/ ctx[27])) {
    				attr_dev(ellipse, "cy", ellipse_cy_value);
    			}

    			if (dirty[0] & /*svgSequence*/ 128 && ellipse_rx_value !== (ellipse_rx_value = /*rx*/ ctx[28])) {
    				attr_dev(ellipse, "rx", ellipse_rx_value);
    			}

    			if (dirty[0] & /*svgSequence*/ 128 && ellipse_ry_value !== (ellipse_ry_value = /*ry*/ ctx[29])) {
    				attr_dev(ellipse, "ry", ellipse_ry_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ellipse);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(68:20) {#each svgSequence as [ fill, opacity, cx, cy, rx, ry ] }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let img;
    	let img_src_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = !/*loaded*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			img = element("img");
    			attr_dev(div0, "class", "photo-spacer svelte-1lgp88u");
    			attr_dev(div0, "style", /*spacerStyle*/ ctx[5]);
    			add_location(div0, file$7, 75, 4, 2595);
    			if (img.src !== (img_src_value = /*src*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "srcset", /*srcset*/ ctx[4]);
    			attr_dev(img, "alt", /*alt*/ ctx[6]);
    			attr_dev(img, "class", "svelte-1lgp88u");
    			toggle_class(img, "show", /*show*/ ctx[0]);
    			add_location(img, file$7, 76, 4, 2649);
    			attr_dev(div1, "class", "photo-inner-frame svelte-1lgp88u");
    			add_location(div1, file$7, 56, 0, 1823);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			append_dev(div1, img);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(img, "load", /*onImageLoad*/ ctx[12], false, false, false),
    					listen_dev(img, "click", /*showPic*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!/*loaded*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*loaded*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*spacerStyle*/ 32) {
    				attr_dev(div0, "style", /*spacerStyle*/ ctx[5]);
    			}

    			if (!current || dirty[0] & /*src*/ 8 && img.src !== (img_src_value = /*src*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty[0] & /*srcset*/ 16) {
    				attr_dev(img, "srcset", /*srcset*/ ctx[4]);
    			}

    			if (!current || dirty[0] & /*alt*/ 64) {
    				attr_dev(img, "alt", /*alt*/ ctx[6]);
    			}

    			if (dirty[0] & /*show*/ 1) {
    				toggle_class(img, "show", /*show*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GalleryImage", slots, []);

    	let { viewLightbox = () => {
    		
    	} } = $$props;

    	const showPic = () => {
    		viewLightbox(fileName);
    	};

    	const srcSizes = [["tiny", "400w"], ["small", "600w"], ["medium", "1180w"]]; // ['large', '1700w']
    	const getSrcSizes = fileName => ([size, width]) => getSizedPath(size, fileName) + " " + width;

    	const getPadding = (width, height) => {
    		if (height > width) {
    			return "100%";
    		}

    		return (100 * height / width).toFixed(2) + "%";
    	};

    	let { imgData } = $$props;
    	let { show } = $$props;
    	let loaded = false;

    	const onImageLoad = () => {
    		$$invalidate(1, loaded = true);
    	};

    	const fadeSlow = { delay: 300, duration: 1600 };
    	const fadeQuick = { delay: 200, duration: 600 };
    	const writable_props = ["viewLightbox", "imgData", "show"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GalleryImage> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("viewLightbox" in $$props) $$invalidate(15, viewLightbox = $$props.viewLightbox);
    		if ("imgData" in $$props) $$invalidate(16, imgData = $$props.imgData);
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		getSizedPath,
    		dummyImage,
    		viewLightbox,
    		showPic,
    		srcSizes,
    		getSrcSizes,
    		getPadding,
    		imgData,
    		show,
    		loaded,
    		onImageLoad,
    		fadeSlow,
    		fadeQuick,
    		fileName,
    		data,
    		width,
    		height,
    		src,
    		srcset,
    		spacerStyle,
    		alt,
    		svgSequence,
    		svgHeight,
    		svgWidth,
    		photoSvgClass,
    		svgScale
    	});

    	$$self.$inject_state = $$props => {
    		if ("viewLightbox" in $$props) $$invalidate(15, viewLightbox = $$props.viewLightbox);
    		if ("imgData" in $$props) $$invalidate(16, imgData = $$props.imgData);
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    		if ("loaded" in $$props) $$invalidate(1, loaded = $$props.loaded);
    		if ("fileName" in $$props) $$invalidate(17, fileName = $$props.fileName);
    		if ("data" in $$props) $$invalidate(18, data = $$props.data);
    		if ("width" in $$props) $$invalidate(19, width = $$props.width);
    		if ("height" in $$props) $$invalidate(20, height = $$props.height);
    		if ("src" in $$props) $$invalidate(3, src = $$props.src);
    		if ("srcset" in $$props) $$invalidate(4, srcset = $$props.srcset);
    		if ("spacerStyle" in $$props) $$invalidate(5, spacerStyle = $$props.spacerStyle);
    		if ("alt" in $$props) $$invalidate(6, alt = $$props.alt);
    		if ("svgSequence" in $$props) $$invalidate(7, svgSequence = $$props.svgSequence);
    		if ("svgHeight" in $$props) $$invalidate(8, svgHeight = $$props.svgHeight);
    		if ("svgWidth" in $$props) $$invalidate(2, svgWidth = $$props.svgWidth);
    		if ("photoSvgClass" in $$props) $$invalidate(9, photoSvgClass = $$props.photoSvgClass);
    		if ("svgScale" in $$props) $$invalidate(10, svgScale = $$props.svgScale);
    	};

    	let data;
    	let fileName;
    	let width;
    	let height;
    	let src;
    	let srcset;
    	let spacerStyle;
    	let alt;
    	let svgSequence;
    	let svgHeight;
    	let svgWidth;
    	let photoSvgClass;
    	let svgScale;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*imgData*/ 65536) {
    			 $$invalidate(18, data = imgData || dummyImage);
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 262144) {
    			 $$invalidate(17, fileName = data.fileName);
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 262144) {
    			 $$invalidate(19, width = data.width);
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 262144) {
    			 $$invalidate(20, height = data.height);
    		}

    		if ($$self.$$.dirty[0] & /*show, fileName*/ 131073) {
    			 $$invalidate(3, src = show ? getSizedPath("small", fileName) : "");
    		}

    		if ($$self.$$.dirty[0] & /*show, fileName*/ 131073) {
    			 $$invalidate(4, srcset = show
    			? srcSizes.map(getSrcSizes(fileName)).join(",")
    			: "");
    		}

    		if ($$self.$$.dirty[0] & /*width, height*/ 1572864) {
    			 $$invalidate(5, spacerStyle = "padding: 0 0 " + getPadding(width, height) + " 0");
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 262144) {
    			 $$invalidate(6, alt = data.description ? data.height.slice(0, 10) : "image");
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 262144) {
    			 $$invalidate(7, svgSequence = data.svgSequence);
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 262144) {
    			 $$invalidate(8, svgHeight = data.svgHeight);
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 262144) {
    			 $$invalidate(2, svgWidth = data.svgWidth);
    		}

    		if ($$self.$$.dirty[0] & /*loaded*/ 2) {
    			 $$invalidate(9, photoSvgClass = "photo-svg" + (loaded ? " image-loaded" : ""));
    		}

    		if ($$self.$$.dirty[0] & /*svgWidth*/ 4) {
    			 $$invalidate(10, svgScale = Number(svgWidth) === 256
    			? ""
    			: "transform: scale(" + (256 / Number(svgWidth)).toFixed(3) + ");");
    		}
    	};

    	return [
    		show,
    		loaded,
    		svgWidth,
    		src,
    		srcset,
    		spacerStyle,
    		alt,
    		svgSequence,
    		svgHeight,
    		photoSvgClass,
    		svgScale,
    		showPic,
    		onImageLoad,
    		fadeSlow,
    		fadeQuick,
    		viewLightbox,
    		imgData,
    		fileName,
    		data,
    		width,
    		height
    	];
    }

    class GalleryImage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { viewLightbox: 15, imgData: 16, show: 0 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GalleryImage",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*imgData*/ ctx[16] === undefined && !("imgData" in props)) {
    			console.warn("<GalleryImage> was created without expected prop 'imgData'");
    		}

    		if (/*show*/ ctx[0] === undefined && !("show" in props)) {
    			console.warn("<GalleryImage> was created without expected prop 'show'");
    		}
    	}

    	get viewLightbox() {
    		throw new Error("<GalleryImage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewLightbox(value) {
    		throw new Error("<GalleryImage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imgData() {
    		throw new Error("<GalleryImage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgData(value) {
    		throw new Error("<GalleryImage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get show() {
    		throw new Error("<GalleryImage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<GalleryImage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* templates\components\GalleryItem.svelte generated by Svelte v3.30.0 */
    const file$8 = "templates\\components\\GalleryItem.svelte";

    // (17:4) <Intersector once={true} let:intersecting={intersecting}>
    function create_default_slot(ctx) {
    	let galleryimage;
    	let current;

    	galleryimage = new GalleryImage({
    			props: {
    				viewLightbox: /*viewLightbox*/ ctx[1],
    				imgData: /*imgData*/ ctx[0],
    				show: /*intersecting*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(galleryimage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(galleryimage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const galleryimage_changes = {};
    			if (dirty & /*viewLightbox*/ 2) galleryimage_changes.viewLightbox = /*viewLightbox*/ ctx[1];
    			if (dirty & /*imgData*/ 1) galleryimage_changes.imgData = /*imgData*/ ctx[0];
    			if (dirty & /*intersecting*/ 16) galleryimage_changes.show = /*intersecting*/ ctx[4];
    			galleryimage.$set(galleryimage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(galleryimage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(galleryimage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(galleryimage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(17:4) <Intersector once={true} let:intersecting={intersecting}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div2;
    	let intersector;
    	let t0;
    	let div1;
    	let div0;
    	let t1_value = (/*imgData*/ ctx[0].description || "Yo dawg.") + "";
    	let t1;
    	let div2_class_value;
    	let current;

    	intersector = new Intersector({
    			props: {
    				once: true,
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ intersecting }) => ({ 4: intersecting }),
    						({ intersecting }) => intersecting ? 16 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			create_component(intersector.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t1 = text(t1_value);
    			attr_dev(div0, "class", "original");
    			add_location(div0, file$8, 20, 8, 647);
    			attr_dev(div1, "class", "description-block svelte-yxfk3p");
    			add_location(div1, file$8, 19, 4, 606);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(/*frameClass*/ ctx[2]) + " svelte-yxfk3p"));
    			add_location(div2, file$8, 15, 0, 422);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			mount_component(intersector, div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const intersector_changes = {};

    			if (dirty & /*$$scope, viewLightbox, imgData, intersecting*/ 51) {
    				intersector_changes.$$scope = { dirty, ctx };
    			}

    			intersector.$set(intersector_changes);
    			if ((!current || dirty & /*imgData*/ 1) && t1_value !== (t1_value = (/*imgData*/ ctx[0].description || "Yo dawg.") + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*frameClass*/ 4 && div2_class_value !== (div2_class_value = "" + (null_to_empty(/*frameClass*/ ctx[2]) + " svelte-yxfk3p"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(intersector.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(intersector.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(intersector);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GalleryItem", slots, []);
    	let { imgData } = $$props;
    	let { mode } = $$props;
    	let { viewLightbox = () => false } = $$props;
    	const writable_props = ["imgData", "mode", "viewLightbox"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GalleryItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("imgData" in $$props) $$invalidate(0, imgData = $$props.imgData);
    		if ("mode" in $$props) $$invalidate(3, mode = $$props.mode);
    		if ("viewLightbox" in $$props) $$invalidate(1, viewLightbox = $$props.viewLightbox);
    	};

    	$$self.$capture_state = () => ({
    		Intersector,
    		GalleryImage,
    		imgData,
    		mode,
    		viewLightbox,
    		frameClass
    	});

    	$$self.$inject_state = $$props => {
    		if ("imgData" in $$props) $$invalidate(0, imgData = $$props.imgData);
    		if ("mode" in $$props) $$invalidate(3, mode = $$props.mode);
    		if ("viewLightbox" in $$props) $$invalidate(1, viewLightbox = $$props.viewLightbox);
    		if ("frameClass" in $$props) $$invalidate(2, frameClass = $$props.frameClass);
    	};

    	let frameClass;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*mode*/ 8) {
    			// console.log('imgData', imgData);
    			 $$invalidate(2, frameClass = "photo-frame" + " " + mode);
    		}
    	};

    	return [imgData, viewLightbox, frameClass, mode];
    }

    class GalleryItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { imgData: 0, mode: 3, viewLightbox: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GalleryItem",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*imgData*/ ctx[0] === undefined && !("imgData" in props)) {
    			console.warn("<GalleryItem> was created without expected prop 'imgData'");
    		}

    		if (/*mode*/ ctx[3] === undefined && !("mode" in props)) {
    			console.warn("<GalleryItem> was created without expected prop 'mode'");
    		}
    	}

    	get imgData() {
    		throw new Error("<GalleryItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgData(value) {
    		throw new Error("<GalleryItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mode() {
    		throw new Error("<GalleryItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mode(value) {
    		throw new Error("<GalleryItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewLightbox() {
    		throw new Error("<GalleryItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewLightbox(value) {
    		throw new Error("<GalleryItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* templates\components\columns\ColumnDragDrop.svelte generated by Svelte v3.30.0 */

    const { console: console_1$1 } = globals;
    const file$9 = "templates\\components\\columns\\ColumnDragDrop.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (108:12) {#each column.items as imgData(imgData.fileName)}
    function create_each_block_1(key_1, ctx) {
    	let div;
    	let galleryitem;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	galleryitem = new GalleryItem({
    			props: {
    				viewLightbox: GalleryStore.viewLightbox,
    				imgData: /*imgData*/ ctx[16],
    				mode: /*mode*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(galleryitem.$$.fragment);
    			attr_dev(div, "class", "drag-animator");
    			add_location(div, file$9, 108, 16, 3625);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(galleryitem, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const galleryitem_changes = {};
    			if (dirty & /*imageBatches*/ 2) galleryitem_changes.imgData = /*imgData*/ ctx[16];
    			if (dirty & /*mode*/ 1) galleryitem_changes.mode = /*mode*/ ctx[0];
    			galleryitem.$set(galleryitem_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: flipDurationMs });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(galleryitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(galleryitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(galleryitem);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(108:12) {#each column.items as imgData(imgData.fileName)}",
    		ctx
    	});

    	return block;
    }

    // (102:4) {#each imageBatches as column(column.columnId)}
    function create_each_block$2(key_1, ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let dndzone_action;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*column*/ ctx[13].items;
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*imgData*/ ctx[16].fileName;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	function consider_handler(...args) {
    		return /*consider_handler*/ ctx[7](/*column*/ ctx[13], ...args);
    	}

    	function finalize_handler(...args) {
    		return /*finalize_handler*/ ctx[8](/*column*/ ctx[13], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "gallery-list svelte-15rvaw6");
    			add_location(div, file$9, 102, 8, 3305);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(dndzone_action = dndzone$2.call(null, div, {
    						items: /*column*/ ctx[13].items,
    						flipDurationMs
    					})),
    					listen_dev(div, "consider", consider_handler, false, false, false),
    					listen_dev(div, "finalize", finalize_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*GalleryStore, imageBatches, mode*/ 3) {
    				const each_value_1 = /*column*/ ctx[13].items;
    				validate_each_argument(each_value_1);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, fix_and_outro_and_destroy_block, create_each_block_1, t, get_each_context_1);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}

    			if (dndzone_action && is_function(dndzone_action.update) && dirty & /*imageBatches*/ 2) dndzone_action.update.call(null, {
    				items: /*column*/ ctx[13].items,
    				flipDurationMs
    			});
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(102:4) {#each imageBatches as column(column.columnId)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div0;
    	let t1;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*imageBatches*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*column*/ ctx[13].columnId;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "XY";
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "toggle svelte-15rvaw6");
    			add_location(div0, file$9, 99, 0, 3164);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*boardClass*/ ctx[2]) + " svelte-15rvaw6"));
    			add_location(div1, file$9, 100, 0, 3218);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*handleToggle*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*imageBatches, flipDurationMs, handleDndConsider, handleDndFinalize, GalleryStore, mode*/ 27) {
    				const each_value = /*imageBatches*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}

    			if (!current || dirty & /*boardClass*/ 4 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*boardClass*/ ctx[2]) + " svelte-15rvaw6"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const flipDurationMs = 200;

    function instance$9($$self, $$props, $$invalidate) {
    	let $GalleryStore;
    	validate_store(GalleryStore, "GalleryStore");
    	component_subscribe($$self, GalleryStore, $$value => $$invalidate(6, $GalleryStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ColumnDragDrop", slots, []);
    	let mode = "single";
    	let updateStoreTimer = null;

    	const batchify = allImages => {
    		// const source = [...allImages];
    		const imageCount = allImages.length;

    		const columns = Math.max(1, Math.floor(getDocWidth() / 180));
    		const columnSize = Math.max(4, Math.ceil(allImages.length / columns));
    		const batch = [];
    		let index = 0;

    		for (let i = 0; i < imageCount; i += columnSize) {
    			batch.push({
    				columnId: index,
    				items: allImages.slice(i, i + columnSize)
    			});

    			index++;
    		}

    		console.log("columns", columns, "  columnSize", columnSize, "  Batch!", batch);
    		return batch;
    	};

    	const updateStore = () => {
    		const update = [];

    		for (const batch of imageBatches) {
    			for (const next of batch.items) {
    				update.push(next);
    			}
    		}

    		GalleryStore.updateImages(update);
    	};

    	function handleDndConsider(cId, e) {
    		// GalleryStore.updateImages(e.detail.items);
    		const index = imageBatches.findIndex(c => c.columnId === cId);

    		console.log("CONSIDER cId", cId, " index", index);
    		$$invalidate(1, imageBatches[index].items = e.detail.items, imageBatches);
    		$$invalidate(1, imageBatches = [...imageBatches]);
    	}

    	function handleDndFinalize(cId, e) {
    		// GalleryStore.updateImages(e.detail.items);
    		const index = imageBatches.findIndex(c => c.columnId === cId);

    		console.log("FINALIZE cId", cId, " index", index);
    		$$invalidate(1, imageBatches[index].items = e.detail.items, imageBatches);
    		$$invalidate(1, imageBatches = [...imageBatches]);
    		clearTimeout(updateStoreTimer);
    		updateStoreTimer = setTimeout(updateStore, 500);
    	}

    	const updateBatches = () => {
    		setTimeout(
    			() => {
    				$$invalidate(1, imageBatches = batchify($GalleryStore.images));
    			},
    			100
    		);
    	};

    	onMount(() => {
    		window.addEventListener("resizeend", updateBatches);
    	});

    	/*
    <div class="column-board">
    {#each imageBatches as column(column.columnId)}
        <div class="gallery-list" use:dndzone={{items: $GalleryStore.images, flipDurationMs}} 
            on:consider="{handleDndConsider}" on:finalize="{handleDndFinalize}">
            {#each $GalleryStore.images as imgData(imgData.fileName)}
                <div class="drag-animator"  animate:flip="{{duration: flipDurationMs}}">
                    <GalleryItem {imgData} />
                </div>
            {/each}
        </div>
    {/each}
    </div>
    */
    	const handleToggle = () => {
    		if (mode === "single") {
    			$$invalidate(0, mode = "compact");
    		} else {
    			$$invalidate(0, mode = "single");
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<ColumnDragDrop> was created with unknown prop '${key}'`);
    	});

    	const consider_handler = (column, e) => handleDndConsider(column.columnId, e);
    	const finalize_handler = (column, e) => handleDndFinalize(column.columnId, e);

    	$$self.$capture_state = () => ({
    		onMount,
    		flip,
    		dndzone: dndzone$2,
    		GalleryStore,
    		GalleryItem,
    		getDocWidth,
    		flipDurationMs,
    		mode,
    		updateStoreTimer,
    		batchify,
    		updateStore,
    		handleDndConsider,
    		handleDndFinalize,
    		updateBatches,
    		handleToggle,
    		imageBatches,
    		$GalleryStore,
    		boardClass
    	});

    	$$self.$inject_state = $$props => {
    		if ("mode" in $$props) $$invalidate(0, mode = $$props.mode);
    		if ("updateStoreTimer" in $$props) updateStoreTimer = $$props.updateStoreTimer;
    		if ("imageBatches" in $$props) $$invalidate(1, imageBatches = $$props.imageBatches);
    		if ("boardClass" in $$props) $$invalidate(2, boardClass = $$props.boardClass);
    	};

    	let imageBatches;
    	let boardClass;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$GalleryStore*/ 64) {
    			 $$invalidate(1, imageBatches = batchify($GalleryStore.images));
    		}

    		if ($$self.$$.dirty & /*mode*/ 1) {
    			 $$invalidate(2, boardClass = "column-board" + " " + mode);
    		}
    	};

    	return [
    		mode,
    		imageBatches,
    		boardClass,
    		handleDndConsider,
    		handleDndFinalize,
    		handleToggle,
    		$GalleryStore,
    		consider_handler,
    		finalize_handler
    	];
    }

    class ColumnDragDrop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColumnDragDrop",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* templates\Album.svelte generated by Svelte v3.30.0 */
    const file$a = "templates\\Album.svelte";

    function create_fragment$a(ctx) {
    	let main;
    	let column;
    	let t;
    	let lightbox;
    	let current;
    	column = new ColumnDragDrop({ $$inline: true });
    	lightbox = new Lightbox({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(column.$$.fragment);
    			t = space();
    			create_component(lightbox.$$.fragment);
    			attr_dev(main, "class", "svelte-1dv8tjo");
    			add_location(main, file$a, 6, 0, 201);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(column, main, null);
    			append_dev(main, t);
    			mount_component(lightbox, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(column.$$.fragment, local);
    			transition_in(lightbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(column.$$.fragment, local);
    			transition_out(lightbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(column);
    			destroy_component(lightbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Album", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Album> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Lightbox, Column: ColumnDragDrop });
    	return [];
    }

    class Album extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Album",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    const startApp = galleryData => {

        if (!galleryData) {
            console.error('GalleryData not found');
            return;
        }

        if (galleryData && galleryData.title) {
            document.title = galleryData.title;
            const titleBar = document.querySelector('#headerBar .page-header-title');
            titleBar.innerHTML = galleryData.title;
        }

        // eslint-disable-next-line no-unused-vars
        const app = new Album({
            target: document.getElementById('mainApp'),
            props: {}
        });

        GalleryStore.set(galleryData);
        GalleryStore.loadFullJSON();

    };

    window.StartApp = startApp;

}());
//# sourceMappingURL=album-app.js.map
