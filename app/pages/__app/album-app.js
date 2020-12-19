
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
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
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
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
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
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
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
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
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
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
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
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
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


        const viewLightbox = fileName => {
            const updated = cloneDeep_1(GALLERY);
            updated.current = fileName;
            updated.active = true;

            console.log('STORE', updated);

            set(updated);
        };

        const updateDescription = (fileName, title, htmlString) => {
            const updated = cloneDeep_1(GALLERY);
            const image = updated.images.find(next => next.fileName === fileName);

            image.description = htmlString;
            image.title = title || '';

            set(updated);
        };

        const closeLightbox = () => {
            const updated = cloneDeep_1(GALLERY);
            updated.active = false;
            set(updated);
        };

        const toggleControlPanel = () => {
            const updated = cloneDeep_1(GALLERY);
            updated.controlPanelOpen = !updated.controlPanelOpen;
            set(updated);
        };

        const updateMeta = updates => {
            const updated = {
                ...GALLERY,
                ...updates
            };
            set(updated);
        };

        return {
            updateImages,
            getAllImages,

            viewLightbox,
            closeLightbox,
            toggleControlPanel,

            updateDescription,
            updateMeta,

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
            this._zoom(-1);
        },
        zoomDown() {
            this._zoom(1);
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

    /* templates\components\icons\IconMagnify.svelte generated by Svelte v3.31.0 */

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

    /* templates\components\icons\IconDeMagnify.svelte generated by Svelte v3.31.0 */

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

    /* templates\components\icons\IconChevronLeft.svelte generated by Svelte v3.31.0 */

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

    /* templates\components\icons\IconChevronRight.svelte generated by Svelte v3.31.0 */

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

    /* templates\components\icons\IconX.svelte generated by Svelte v3.31.0 */

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

    /* templates\components\lightbox\Lightbox.svelte generated by Svelte v3.31.0 */

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
    			add_location(div0, file$5, 215, 4, 6880);
    			attr_dev(div1, "class", "icon-button de-magnify svelte-10pajrg");
    			add_location(div1, file$5, 216, 4, 6958);
    			attr_dev(div2, "class", "icon-button close-me svelte-10pajrg");
    			add_location(div2, file$5, 217, 4, 7042);
    			attr_dev(div3, "class", "prior svelte-10pajrg");
    			add_location(div3, file$5, 219, 4, 7118);
    			attr_dev(div4, "class", "next svelte-10pajrg");
    			add_location(div4, file$5, 220, 4, 7189);
    			attr_dev(div5, "class", "description");
    			add_location(div5, file$5, 249, 8, 8440);
    			attr_dev(div6, "class", "download-button");
    			add_location(div6, file$5, 250, 8, 8481);
    			attr_dev(div7, "class", "description-panel svelte-10pajrg");
    			add_location(div7, file$5, 248, 4, 8399);
    			attr_dev(div8, "class", div8_class_value = "" + (null_to_empty(/*lightboxClass*/ ctx[10]) + " svelte-10pajrg"));
    			add_location(div8, file$5, 213, 0, 6828);
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
    			add_location(img, file$5, 243, 12, 8260);
    			attr_dev(div0, "class", "photo svelte-10pajrg");
    			attr_dev(div0, "style", /*photoScale*/ ctx[12]);
    			add_location(div0, file$5, 224, 8, 7339);
    			attr_dev(div1, "class", "photo-frame svelte-10pajrg");
    			add_location(div1, file$5, 223, 4, 7280);
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

    			add_location(g, file$5, 234, 24, 7898);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*svgWidth*/ ctx[9] + " " + /*svgHeight*/ ctx[8]);
    			attr_dev(svg, "class", "svelte-10pajrg");
    			add_location(svg, file$5, 228, 20, 7494);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*photoSvgClass*/ ctx[11]) + " svelte-10pajrg"));
    			add_location(div, file$5, 227, 16, 7424);
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
    			add_location(rect, file$5, 231, 28, 7716);
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
    			add_location(ellipse, file$5, 236, 32, 8022);
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
    				speed: 6,
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
    			 $$invalidate(4, alt = data.title || "image");
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

    /* node_modules\svelte-icons\components\IconBase.svelte generated by Svelte v3.31.0 */

    const file$6 = "node_modules\\svelte-icons\\components\\IconBase.svelte";

    // (18:2) {#if title}
    function create_if_block$1(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[0]);
    			add_location(title_1, file$6, 18, 4, 298);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(18:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let svg;
    	let if_block_anchor;
    	let current;
    	let if_block = /*title*/ ctx[0] && create_if_block$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (default_slot) default_slot.c();
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
    			attr_dev(svg, "class", "svelte-c8tyih");
    			add_location(svg, file$6, 16, 0, 229);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, if_block_anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(svg, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*viewBox*/ 2) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
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
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
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
    	validate_slots("IconBase", slots, ['default']);
    	let { title = null } = $$props;
    	let { viewBox } = $$props;
    	const writable_props = ["title", "viewBox"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IconBase> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("viewBox" in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ title, viewBox });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("viewBox" in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, viewBox, $$scope, slots];
    }

    class IconBase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { title: 0, viewBox: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconBase",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*viewBox*/ ctx[1] === undefined && !("viewBox" in props)) {
    			console.warn("<IconBase> was created without expected prop 'viewBox'");
    		}
    	}

    	get title() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewBox() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewBox(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-icons\md\MdList.svelte generated by Svelte v3.31.0 */
    const file$7 = "node_modules\\svelte-icons\\md\\MdList.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z");
    			add_location(path, file$7, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
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
    	validate_slots("MdList", slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdList",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    var flatpickr = createCommonjsModule(function (module, exports) {
    /* flatpickr v4.6.6, @license MIT */
    (function (global, factory) {
         module.exports = factory() ;
    }(commonjsGlobal, (function () {
        /*! *****************************************************************************
        Copyright (c) Microsoft Corporation.

        Permission to use, copy, modify, and/or distribute this software for any
        purpose with or without fee is hereby granted.

        THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
        REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
        AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
        INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
        LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
        OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
        PERFORMANCE OF THIS SOFTWARE.
        ***************************************************************************** */

        var __assign = function() {
            __assign = Object.assign || function __assign(t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
                }
                return t;
            };
            return __assign.apply(this, arguments);
        };

        function __spreadArrays() {
            for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
            for (var r = Array(s), k = 0, i = 0; i < il; i++)
                for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                    r[k] = a[j];
            return r;
        }

        var HOOKS = [
            "onChange",
            "onClose",
            "onDayCreate",
            "onDestroy",
            "onKeyDown",
            "onMonthChange",
            "onOpen",
            "onParseConfig",
            "onReady",
            "onValueUpdate",
            "onYearChange",
            "onPreCalendarPosition",
        ];
        var defaults = {
            _disable: [],
            _enable: [],
            allowInput: false,
            allowInvalidPreload: false,
            altFormat: "F j, Y",
            altInput: false,
            altInputClass: "form-control input",
            animate: typeof window === "object" &&
                window.navigator.userAgent.indexOf("MSIE") === -1,
            ariaDateFormat: "F j, Y",
            autoFillDefaultTime: true,
            clickOpens: true,
            closeOnSelect: true,
            conjunction: ", ",
            dateFormat: "Y-m-d",
            defaultHour: 12,
            defaultMinute: 0,
            defaultSeconds: 0,
            disable: [],
            disableMobile: false,
            enable: [],
            enableSeconds: false,
            enableTime: false,
            errorHandler: function (err) {
                return typeof console !== "undefined" && console.warn(err);
            },
            getWeek: function (givenDate) {
                var date = new Date(givenDate.getTime());
                date.setHours(0, 0, 0, 0);
                // Thursday in current week decides the year.
                date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
                // January 4 is always in week 1.
                var week1 = new Date(date.getFullYear(), 0, 4);
                // Adjust to Thursday in week 1 and count number of weeks from date to week1.
                return (1 +
                    Math.round(((date.getTime() - week1.getTime()) / 86400000 -
                        3 +
                        ((week1.getDay() + 6) % 7)) /
                        7));
            },
            hourIncrement: 1,
            ignoredFocusElements: [],
            inline: false,
            locale: "default",
            minuteIncrement: 5,
            mode: "single",
            monthSelectorType: "dropdown",
            nextArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M13.207 8.472l-7.854 7.854-0.707-0.707 7.146-7.146-7.146-7.148 0.707-0.707 7.854 7.854z' /></svg>",
            noCalendar: false,
            now: new Date(),
            onChange: [],
            onClose: [],
            onDayCreate: [],
            onDestroy: [],
            onKeyDown: [],
            onMonthChange: [],
            onOpen: [],
            onParseConfig: [],
            onReady: [],
            onValueUpdate: [],
            onYearChange: [],
            onPreCalendarPosition: [],
            plugins: [],
            position: "auto",
            positionElement: undefined,
            prevArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M5.207 8.471l7.146 7.147-0.707 0.707-7.853-7.854 7.854-7.853 0.707 0.707-7.147 7.146z' /></svg>",
            shorthandCurrentMonth: false,
            showMonths: 1,
            static: false,
            time_24hr: false,
            weekNumbers: false,
            wrap: false,
        };

        var english = {
            weekdays: {
                shorthand: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                longhand: [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                ],
            },
            months: {
                shorthand: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ],
                longhand: [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                ],
            },
            daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            firstDayOfWeek: 0,
            ordinal: function (nth) {
                var s = nth % 100;
                if (s > 3 && s < 21)
                    return "th";
                switch (s % 10) {
                    case 1:
                        return "st";
                    case 2:
                        return "nd";
                    case 3:
                        return "rd";
                    default:
                        return "th";
                }
            },
            rangeSeparator: " to ",
            weekAbbreviation: "Wk",
            scrollTitle: "Scroll to increment",
            toggleTitle: "Click to toggle",
            amPM: ["AM", "PM"],
            yearAriaLabel: "Year",
            monthAriaLabel: "Month",
            hourAriaLabel: "Hour",
            minuteAriaLabel: "Minute",
            time_24hr: false,
        };

        var pad = function (number, length) {
            if (length === void 0) { length = 2; }
            return ("000" + number).slice(length * -1);
        };
        var int = function (bool) { return (bool === true ? 1 : 0); };
        /* istanbul ignore next */
        function debounce(func, wait, immediate) {
            if (immediate === void 0) { immediate = false; }
            var timeout;
            return function () {
                var context = this, args = arguments;
                timeout !== null && clearTimeout(timeout);
                timeout = window.setTimeout(function () {
                    timeout = null;
                    if (!immediate)
                        func.apply(context, args);
                }, wait);
                if (immediate && !timeout)
                    func.apply(context, args);
            };
        }
        var arrayify = function (obj) {
            return obj instanceof Array ? obj : [obj];
        };

        function toggleClass(elem, className, bool) {
            if (bool === true)
                return elem.classList.add(className);
            elem.classList.remove(className);
        }
        function createElement(tag, className, content) {
            var e = window.document.createElement(tag);
            className = className || "";
            content = content || "";
            e.className = className;
            if (content !== undefined)
                e.textContent = content;
            return e;
        }
        function clearNode(node) {
            while (node.firstChild)
                node.removeChild(node.firstChild);
        }
        function findParent(node, condition) {
            if (condition(node))
                return node;
            else if (node.parentNode)
                return findParent(node.parentNode, condition);
            return undefined; // nothing found
        }
        function createNumberInput(inputClassName, opts) {
            var wrapper = createElement("div", "numInputWrapper"), numInput = createElement("input", "numInput " + inputClassName), arrowUp = createElement("span", "arrowUp"), arrowDown = createElement("span", "arrowDown");
            if (navigator.userAgent.indexOf("MSIE 9.0") === -1) {
                numInput.type = "number";
            }
            else {
                numInput.type = "text";
                numInput.pattern = "\\d*";
            }
            if (opts !== undefined)
                for (var key in opts)
                    numInput.setAttribute(key, opts[key]);
            wrapper.appendChild(numInput);
            wrapper.appendChild(arrowUp);
            wrapper.appendChild(arrowDown);
            return wrapper;
        }
        function getEventTarget(event) {
            try {
                if (typeof event.composedPath === "function") {
                    var path = event.composedPath();
                    return path[0];
                }
                return event.target;
            }
            catch (error) {
                return event.target;
            }
        }

        var doNothing = function () { return undefined; };
        var monthToStr = function (monthNumber, shorthand, locale) { return locale.months[shorthand ? "shorthand" : "longhand"][monthNumber]; };
        var revFormat = {
            D: doNothing,
            F: function (dateObj, monthName, locale) {
                dateObj.setMonth(locale.months.longhand.indexOf(monthName));
            },
            G: function (dateObj, hour) {
                dateObj.setHours(parseFloat(hour));
            },
            H: function (dateObj, hour) {
                dateObj.setHours(parseFloat(hour));
            },
            J: function (dateObj, day) {
                dateObj.setDate(parseFloat(day));
            },
            K: function (dateObj, amPM, locale) {
                dateObj.setHours((dateObj.getHours() % 12) +
                    12 * int(new RegExp(locale.amPM[1], "i").test(amPM)));
            },
            M: function (dateObj, shortMonth, locale) {
                dateObj.setMonth(locale.months.shorthand.indexOf(shortMonth));
            },
            S: function (dateObj, seconds) {
                dateObj.setSeconds(parseFloat(seconds));
            },
            U: function (_, unixSeconds) { return new Date(parseFloat(unixSeconds) * 1000); },
            W: function (dateObj, weekNum, locale) {
                var weekNumber = parseInt(weekNum);
                var date = new Date(dateObj.getFullYear(), 0, 2 + (weekNumber - 1) * 7, 0, 0, 0, 0);
                date.setDate(date.getDate() - date.getDay() + locale.firstDayOfWeek);
                return date;
            },
            Y: function (dateObj, year) {
                dateObj.setFullYear(parseFloat(year));
            },
            Z: function (_, ISODate) { return new Date(ISODate); },
            d: function (dateObj, day) {
                dateObj.setDate(parseFloat(day));
            },
            h: function (dateObj, hour) {
                dateObj.setHours(parseFloat(hour));
            },
            i: function (dateObj, minutes) {
                dateObj.setMinutes(parseFloat(minutes));
            },
            j: function (dateObj, day) {
                dateObj.setDate(parseFloat(day));
            },
            l: doNothing,
            m: function (dateObj, month) {
                dateObj.setMonth(parseFloat(month) - 1);
            },
            n: function (dateObj, month) {
                dateObj.setMonth(parseFloat(month) - 1);
            },
            s: function (dateObj, seconds) {
                dateObj.setSeconds(parseFloat(seconds));
            },
            u: function (_, unixMillSeconds) {
                return new Date(parseFloat(unixMillSeconds));
            },
            w: doNothing,
            y: function (dateObj, year) {
                dateObj.setFullYear(2000 + parseFloat(year));
            },
        };
        var tokenRegex = {
            D: "(\\w+)",
            F: "(\\w+)",
            G: "(\\d\\d|\\d)",
            H: "(\\d\\d|\\d)",
            J: "(\\d\\d|\\d)\\w+",
            K: "",
            M: "(\\w+)",
            S: "(\\d\\d|\\d)",
            U: "(.+)",
            W: "(\\d\\d|\\d)",
            Y: "(\\d{4})",
            Z: "(.+)",
            d: "(\\d\\d|\\d)",
            h: "(\\d\\d|\\d)",
            i: "(\\d\\d|\\d)",
            j: "(\\d\\d|\\d)",
            l: "(\\w+)",
            m: "(\\d\\d|\\d)",
            n: "(\\d\\d|\\d)",
            s: "(\\d\\d|\\d)",
            u: "(.+)",
            w: "(\\d\\d|\\d)",
            y: "(\\d{2})",
        };
        var formats = {
            // get the date in UTC
            Z: function (date) { return date.toISOString(); },
            // weekday name, short, e.g. Thu
            D: function (date, locale, options) {
                return locale.weekdays.shorthand[formats.w(date, locale, options)];
            },
            // full month name e.g. January
            F: function (date, locale, options) {
                return monthToStr(formats.n(date, locale, options) - 1, false, locale);
            },
            // padded hour 1-12
            G: function (date, locale, options) {
                return pad(formats.h(date, locale, options));
            },
            // hours with leading zero e.g. 03
            H: function (date) { return pad(date.getHours()); },
            // day (1-30) with ordinal suffix e.g. 1st, 2nd
            J: function (date, locale) {
                return locale.ordinal !== undefined
                    ? date.getDate() + locale.ordinal(date.getDate())
                    : date.getDate();
            },
            // AM/PM
            K: function (date, locale) { return locale.amPM[int(date.getHours() > 11)]; },
            // shorthand month e.g. Jan, Sep, Oct, etc
            M: function (date, locale) {
                return monthToStr(date.getMonth(), true, locale);
            },
            // seconds 00-59
            S: function (date) { return pad(date.getSeconds()); },
            // unix timestamp
            U: function (date) { return date.getTime() / 1000; },
            W: function (date, _, options) {
                return options.getWeek(date);
            },
            // full year e.g. 2016, padded (0001-9999)
            Y: function (date) { return pad(date.getFullYear(), 4); },
            // day in month, padded (01-30)
            d: function (date) { return pad(date.getDate()); },
            // hour from 1-12 (am/pm)
            h: function (date) { return (date.getHours() % 12 ? date.getHours() % 12 : 12); },
            // minutes, padded with leading zero e.g. 09
            i: function (date) { return pad(date.getMinutes()); },
            // day in month (1-30)
            j: function (date) { return date.getDate(); },
            // weekday name, full, e.g. Thursday
            l: function (date, locale) {
                return locale.weekdays.longhand[date.getDay()];
            },
            // padded month number (01-12)
            m: function (date) { return pad(date.getMonth() + 1); },
            // the month number (1-12)
            n: function (date) { return date.getMonth() + 1; },
            // seconds 0-59
            s: function (date) { return date.getSeconds(); },
            // Unix Milliseconds
            u: function (date) { return date.getTime(); },
            // number of the day of the week
            w: function (date) { return date.getDay(); },
            // last two digits of year e.g. 16 for 2016
            y: function (date) { return String(date.getFullYear()).substring(2); },
        };

        var createDateFormatter = function (_a) {
            var _b = _a.config, config = _b === void 0 ? defaults : _b, _c = _a.l10n, l10n = _c === void 0 ? english : _c, _d = _a.isMobile, isMobile = _d === void 0 ? false : _d;
            return function (dateObj, frmt, overrideLocale) {
                var locale = overrideLocale || l10n;
                if (config.formatDate !== undefined && !isMobile) {
                    return config.formatDate(dateObj, frmt, locale);
                }
                return frmt
                    .split("")
                    .map(function (c, i, arr) {
                    return formats[c] && arr[i - 1] !== "\\"
                        ? formats[c](dateObj, locale, config)
                        : c !== "\\"
                            ? c
                            : "";
                })
                    .join("");
            };
        };
        var createDateParser = function (_a) {
            var _b = _a.config, config = _b === void 0 ? defaults : _b, _c = _a.l10n, l10n = _c === void 0 ? english : _c;
            return function (date, givenFormat, timeless, customLocale) {
                if (date !== 0 && !date)
                    return undefined;
                var locale = customLocale || l10n;
                var parsedDate;
                var dateOrig = date;
                if (date instanceof Date)
                    parsedDate = new Date(date.getTime());
                else if (typeof date !== "string" &&
                    date.toFixed !== undefined // timestamp
                )
                    // create a copy
                    parsedDate = new Date(date);
                else if (typeof date === "string") {
                    // date string
                    var format = givenFormat || (config || defaults).dateFormat;
                    var datestr = String(date).trim();
                    if (datestr === "today") {
                        parsedDate = new Date();
                        timeless = true;
                    }
                    else if (/Z$/.test(datestr) ||
                        /GMT$/.test(datestr) // datestrings w/ timezone
                    )
                        parsedDate = new Date(date);
                    else if (config && config.parseDate)
                        parsedDate = config.parseDate(date, format);
                    else {
                        parsedDate =
                            !config || !config.noCalendar
                                ? new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0)
                                : new Date(new Date().setHours(0, 0, 0, 0));
                        var matched = void 0, ops = [];
                        for (var i = 0, matchIndex = 0, regexStr = ""; i < format.length; i++) {
                            var token_1 = format[i];
                            var isBackSlash = token_1 === "\\";
                            var escaped = format[i - 1] === "\\" || isBackSlash;
                            if (tokenRegex[token_1] && !escaped) {
                                regexStr += tokenRegex[token_1];
                                var match = new RegExp(regexStr).exec(date);
                                if (match && (matched = true)) {
                                    ops[token_1 !== "Y" ? "push" : "unshift"]({
                                        fn: revFormat[token_1],
                                        val: match[++matchIndex],
                                    });
                                }
                            }
                            else if (!isBackSlash)
                                regexStr += "."; // don't really care
                            ops.forEach(function (_a) {
                                var fn = _a.fn, val = _a.val;
                                return (parsedDate = fn(parsedDate, val, locale) || parsedDate);
                            });
                        }
                        parsedDate = matched ? parsedDate : undefined;
                    }
                }
                /* istanbul ignore next */
                if (!(parsedDate instanceof Date && !isNaN(parsedDate.getTime()))) {
                    config.errorHandler(new Error("Invalid date provided: " + dateOrig));
                    return undefined;
                }
                if (timeless === true)
                    parsedDate.setHours(0, 0, 0, 0);
                return parsedDate;
            };
        };
        /**
         * Compute the difference in dates, measured in ms
         */
        function compareDates(date1, date2, timeless) {
            if (timeless === void 0) { timeless = true; }
            if (timeless !== false) {
                return (new Date(date1.getTime()).setHours(0, 0, 0, 0) -
                    new Date(date2.getTime()).setHours(0, 0, 0, 0));
            }
            return date1.getTime() - date2.getTime();
        }
        var isBetween = function (ts, ts1, ts2) {
            return ts > Math.min(ts1, ts2) && ts < Math.max(ts1, ts2);
        };
        var duration = {
            DAY: 86400000,
        };

        if (typeof Object.assign !== "function") {
            Object.assign = function (target) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                if (!target) {
                    throw TypeError("Cannot convert undefined or null to object");
                }
                var _loop_1 = function (source) {
                    if (source) {
                        Object.keys(source).forEach(function (key) { return (target[key] = source[key]); });
                    }
                };
                for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
                    var source = args_1[_a];
                    _loop_1(source);
                }
                return target;
            };
        }

        var DEBOUNCED_CHANGE_MS = 300;
        function FlatpickrInstance(element, instanceConfig) {
            var self = {
                config: __assign(__assign({}, defaults), flatpickr.defaultConfig),
                l10n: english,
            };
            self.parseDate = createDateParser({ config: self.config, l10n: self.l10n });
            self._handlers = [];
            self.pluginElements = [];
            self.loadedPlugins = [];
            self._bind = bind;
            self._setHoursFromDate = setHoursFromDate;
            self._positionCalendar = positionCalendar;
            self.changeMonth = changeMonth;
            self.changeYear = changeYear;
            self.clear = clear;
            self.close = close;
            self._createElement = createElement;
            self.destroy = destroy;
            self.isEnabled = isEnabled;
            self.jumpToDate = jumpToDate;
            self.open = open;
            self.redraw = redraw;
            self.set = set;
            self.setDate = setDate;
            self.toggle = toggle;
            function setupHelperFunctions() {
                self.utils = {
                    getDaysInMonth: function (month, yr) {
                        if (month === void 0) { month = self.currentMonth; }
                        if (yr === void 0) { yr = self.currentYear; }
                        if (month === 1 && ((yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0))
                            return 29;
                        return self.l10n.daysInMonth[month];
                    },
                };
            }
            function init() {
                self.element = self.input = element;
                self.isOpen = false;
                parseConfig();
                setupLocale();
                setupInputs();
                setupDates();
                setupHelperFunctions();
                if (!self.isMobile)
                    build();
                bindEvents();
                if (self.selectedDates.length || self.config.noCalendar) {
                    if (self.config.enableTime) {
                        setHoursFromDate(self.config.noCalendar
                            ? self.latestSelectedDateObj || self.config.minDate
                            : undefined);
                    }
                    updateValue(false);
                }
                setCalendarWidth();
                var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                /* TODO: investigate this further
            
                  Currently, there is weird positioning behavior in safari causing pages
                  to scroll up. https://github.com/chmln/flatpickr/issues/563
            
                  However, most browsers are not Safari and positioning is expensive when used
                  in scale. https://github.com/chmln/flatpickr/issues/1096
                */
                if (!self.isMobile && isSafari) {
                    positionCalendar();
                }
                triggerEvent("onReady");
            }
            function bindToInstance(fn) {
                return fn.bind(self);
            }
            function setCalendarWidth() {
                var config = self.config;
                if (config.weekNumbers === false && config.showMonths === 1) {
                    return;
                }
                else if (config.noCalendar !== true) {
                    window.requestAnimationFrame(function () {
                        if (self.calendarContainer !== undefined) {
                            self.calendarContainer.style.visibility = "hidden";
                            self.calendarContainer.style.display = "block";
                        }
                        if (self.daysContainer !== undefined) {
                            var daysWidth = (self.days.offsetWidth + 1) * config.showMonths;
                            self.daysContainer.style.width = daysWidth + "px";
                            self.calendarContainer.style.width =
                                daysWidth +
                                    (self.weekWrapper !== undefined
                                        ? self.weekWrapper.offsetWidth
                                        : 0) +
                                    "px";
                            self.calendarContainer.style.removeProperty("visibility");
                            self.calendarContainer.style.removeProperty("display");
                        }
                    });
                }
            }
            /**
             * The handler for all events targeting the time inputs
             */
            function updateTime(e) {
                if (self.selectedDates.length === 0) {
                    var defaultDate = self.config.minDate !== undefined
                        ? new Date(self.config.minDate.getTime())
                        : new Date();
                    var _a = getDefaultHours(), hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds;
                    defaultDate.setHours(hours, minutes, seconds, 0);
                    self.setDate(defaultDate, false);
                }
                if (e !== undefined && e.type !== "blur") {
                    timeWrapper(e);
                }
                var prevValue = self._input.value;
                setHoursFromInputs();
                updateValue();
                if (self._input.value !== prevValue) {
                    self._debouncedChange();
                }
            }
            function ampm2military(hour, amPM) {
                return (hour % 12) + 12 * int(amPM === self.l10n.amPM[1]);
            }
            function military2ampm(hour) {
                switch (hour % 24) {
                    case 0:
                    case 12:
                        return 12;
                    default:
                        return hour % 12;
                }
            }
            /**
             * Syncs the selected date object time with user's time input
             */
            function setHoursFromInputs() {
                if (self.hourElement === undefined || self.minuteElement === undefined)
                    return;
                var hours = (parseInt(self.hourElement.value.slice(-2), 10) || 0) % 24, minutes = (parseInt(self.minuteElement.value, 10) || 0) % 60, seconds = self.secondElement !== undefined
                    ? (parseInt(self.secondElement.value, 10) || 0) % 60
                    : 0;
                if (self.amPM !== undefined) {
                    hours = ampm2military(hours, self.amPM.textContent);
                }
                var limitMinHours = self.config.minTime !== undefined ||
                    (self.config.minDate &&
                        self.minDateHasTime &&
                        self.latestSelectedDateObj &&
                        compareDates(self.latestSelectedDateObj, self.config.minDate, true) ===
                            0);
                var limitMaxHours = self.config.maxTime !== undefined ||
                    (self.config.maxDate &&
                        self.maxDateHasTime &&
                        self.latestSelectedDateObj &&
                        compareDates(self.latestSelectedDateObj, self.config.maxDate, true) ===
                            0);
                if (limitMaxHours) {
                    var maxTime = self.config.maxTime !== undefined
                        ? self.config.maxTime
                        : self.config.maxDate;
                    hours = Math.min(hours, maxTime.getHours());
                    if (hours === maxTime.getHours())
                        minutes = Math.min(minutes, maxTime.getMinutes());
                    if (minutes === maxTime.getMinutes())
                        seconds = Math.min(seconds, maxTime.getSeconds());
                }
                if (limitMinHours) {
                    var minTime = self.config.minTime !== undefined
                        ? self.config.minTime
                        : self.config.minDate;
                    hours = Math.max(hours, minTime.getHours());
                    if (hours === minTime.getHours())
                        minutes = Math.max(minutes, minTime.getMinutes());
                    if (minutes === minTime.getMinutes())
                        seconds = Math.max(seconds, minTime.getSeconds());
                }
                setHours(hours, minutes, seconds);
            }
            /**
             * Syncs time input values with a date
             */
            function setHoursFromDate(dateObj) {
                var date = dateObj || self.latestSelectedDateObj;
                if (date) {
                    setHours(date.getHours(), date.getMinutes(), date.getSeconds());
                }
            }
            function getDefaultHours() {
                var hours = self.config.defaultHour;
                var minutes = self.config.defaultMinute;
                var seconds = self.config.defaultSeconds;
                if (self.config.minDate !== undefined) {
                    var minHr = self.config.minDate.getHours();
                    var minMinutes = self.config.minDate.getMinutes();
                    hours = Math.max(hours, minHr);
                    if (hours === minHr)
                        minutes = Math.max(minMinutes, minutes);
                    if (hours === minHr && minutes === minMinutes)
                        seconds = self.config.minDate.getSeconds();
                }
                if (self.config.maxDate !== undefined) {
                    var maxHr = self.config.maxDate.getHours();
                    var maxMinutes = self.config.maxDate.getMinutes();
                    hours = Math.min(hours, maxHr);
                    if (hours === maxHr)
                        minutes = Math.min(maxMinutes, minutes);
                    if (hours === maxHr && minutes === maxMinutes)
                        seconds = self.config.maxDate.getSeconds();
                }
                return { hours: hours, minutes: minutes, seconds: seconds };
            }
            /**
             * Sets the hours, minutes, and optionally seconds
             * of the latest selected date object and the
             * corresponding time inputs
             * @param {Number} hours the hour. whether its military
             *                 or am-pm gets inferred from config
             * @param {Number} minutes the minutes
             * @param {Number} seconds the seconds (optional)
             */
            function setHours(hours, minutes, seconds) {
                if (self.latestSelectedDateObj !== undefined) {
                    self.latestSelectedDateObj.setHours(hours % 24, minutes, seconds || 0, 0);
                }
                if (!self.hourElement || !self.minuteElement || self.isMobile)
                    return;
                self.hourElement.value = pad(!self.config.time_24hr
                    ? ((12 + hours) % 12) + 12 * int(hours % 12 === 0)
                    : hours);
                self.minuteElement.value = pad(minutes);
                if (self.amPM !== undefined)
                    self.amPM.textContent = self.l10n.amPM[int(hours >= 12)];
                if (self.secondElement !== undefined)
                    self.secondElement.value = pad(seconds);
            }
            /**
             * Handles the year input and incrementing events
             * @param {Event} event the keyup or increment event
             */
            function onYearInput(event) {
                var eventTarget = getEventTarget(event);
                var year = parseInt(eventTarget.value) + (event.delta || 0);
                if (year / 1000 > 1 ||
                    (event.key === "Enter" && !/[^\d]/.test(year.toString()))) {
                    changeYear(year);
                }
            }
            /**
             * Essentially addEventListener + tracking
             * @param {Element} element the element to addEventListener to
             * @param {String} event the event name
             * @param {Function} handler the event handler
             */
            function bind(element, event, handler, options) {
                if (event instanceof Array)
                    return event.forEach(function (ev) { return bind(element, ev, handler, options); });
                if (element instanceof Array)
                    return element.forEach(function (el) { return bind(el, event, handler, options); });
                element.addEventListener(event, handler, options);
                self._handlers.push({
                    element: element,
                    event: event,
                    handler: handler,
                    options: options,
                });
            }
            function triggerChange() {
                triggerEvent("onChange");
            }
            /**
             * Adds all the necessary event listeners
             */
            function bindEvents() {
                if (self.config.wrap) {
                    ["open", "close", "toggle", "clear"].forEach(function (evt) {
                        Array.prototype.forEach.call(self.element.querySelectorAll("[data-" + evt + "]"), function (el) {
                            return bind(el, "click", self[evt]);
                        });
                    });
                }
                if (self.isMobile) {
                    setupMobile();
                    return;
                }
                var debouncedResize = debounce(onResize, 50);
                self._debouncedChange = debounce(triggerChange, DEBOUNCED_CHANGE_MS);
                if (self.daysContainer && !/iPhone|iPad|iPod/i.test(navigator.userAgent))
                    bind(self.daysContainer, "mouseover", function (e) {
                        if (self.config.mode === "range")
                            onMouseOver(getEventTarget(e));
                    });
                bind(window.document.body, "keydown", onKeyDown);
                if (!self.config.inline && !self.config.static)
                    bind(window, "resize", debouncedResize);
                if (window.ontouchstart !== undefined)
                    bind(window.document, "touchstart", documentClick);
                else
                    bind(window.document, "click", documentClick);
                bind(window.document, "focus", documentClick, { capture: true });
                if (self.config.clickOpens === true) {
                    bind(self._input, "focus", self.open);
                    bind(self._input, "click", self.open);
                }
                if (self.daysContainer !== undefined) {
                    bind(self.monthNav, "click", onMonthNavClick);
                    bind(self.monthNav, ["keyup", "increment"], onYearInput);
                    bind(self.daysContainer, "click", selectDate);
                }
                if (self.timeContainer !== undefined &&
                    self.minuteElement !== undefined &&
                    self.hourElement !== undefined) {
                    var selText = function (e) {
                        return getEventTarget(e).select();
                    };
                    bind(self.timeContainer, ["increment"], updateTime);
                    bind(self.timeContainer, "blur", updateTime, { capture: true });
                    bind(self.timeContainer, "click", timeIncrement);
                    bind([self.hourElement, self.minuteElement], ["focus", "click"], selText);
                    if (self.secondElement !== undefined)
                        bind(self.secondElement, "focus", function () { return self.secondElement && self.secondElement.select(); });
                    if (self.amPM !== undefined) {
                        bind(self.amPM, "click", function (e) {
                            updateTime(e);
                            triggerChange();
                        });
                    }
                }
                if (self.config.allowInput)
                    bind(self._input, "blur", onBlur);
            }
            /**
             * Set the calendar view to a particular date.
             * @param {Date} jumpDate the date to set the view to
             * @param {boolean} triggerChange if change events should be triggered
             */
            function jumpToDate(jumpDate, triggerChange) {
                var jumpTo = jumpDate !== undefined
                    ? self.parseDate(jumpDate)
                    : self.latestSelectedDateObj ||
                        (self.config.minDate && self.config.minDate > self.now
                            ? self.config.minDate
                            : self.config.maxDate && self.config.maxDate < self.now
                                ? self.config.maxDate
                                : self.now);
                var oldYear = self.currentYear;
                var oldMonth = self.currentMonth;
                try {
                    if (jumpTo !== undefined) {
                        self.currentYear = jumpTo.getFullYear();
                        self.currentMonth = jumpTo.getMonth();
                    }
                }
                catch (e) {
                    /* istanbul ignore next */
                    e.message = "Invalid date supplied: " + jumpTo;
                    self.config.errorHandler(e);
                }
                if (triggerChange && self.currentYear !== oldYear) {
                    triggerEvent("onYearChange");
                    buildMonthSwitch();
                }
                if (triggerChange &&
                    (self.currentYear !== oldYear || self.currentMonth !== oldMonth)) {
                    triggerEvent("onMonthChange");
                }
                self.redraw();
            }
            /**
             * The up/down arrow handler for time inputs
             * @param {Event} e the click event
             */
            function timeIncrement(e) {
                var eventTarget = getEventTarget(e);
                if (~eventTarget.className.indexOf("arrow"))
                    incrementNumInput(e, eventTarget.classList.contains("arrowUp") ? 1 : -1);
            }
            /**
             * Increments/decrements the value of input associ-
             * ated with the up/down arrow by dispatching an
             * "increment" event on the input.
             *
             * @param {Event} e the click event
             * @param {Number} delta the diff (usually 1 or -1)
             * @param {Element} inputElem the input element
             */
            function incrementNumInput(e, delta, inputElem) {
                var target = e && getEventTarget(e);
                var input = inputElem ||
                    (target && target.parentNode && target.parentNode.firstChild);
                var event = createEvent("increment");
                event.delta = delta;
                input && input.dispatchEvent(event);
            }
            function build() {
                var fragment = window.document.createDocumentFragment();
                self.calendarContainer = createElement("div", "flatpickr-calendar");
                self.calendarContainer.tabIndex = -1;
                if (!self.config.noCalendar) {
                    fragment.appendChild(buildMonthNav());
                    self.innerContainer = createElement("div", "flatpickr-innerContainer");
                    if (self.config.weekNumbers) {
                        var _a = buildWeeks(), weekWrapper = _a.weekWrapper, weekNumbers = _a.weekNumbers;
                        self.innerContainer.appendChild(weekWrapper);
                        self.weekNumbers = weekNumbers;
                        self.weekWrapper = weekWrapper;
                    }
                    self.rContainer = createElement("div", "flatpickr-rContainer");
                    self.rContainer.appendChild(buildWeekdays());
                    if (!self.daysContainer) {
                        self.daysContainer = createElement("div", "flatpickr-days");
                        self.daysContainer.tabIndex = -1;
                    }
                    buildDays();
                    self.rContainer.appendChild(self.daysContainer);
                    self.innerContainer.appendChild(self.rContainer);
                    fragment.appendChild(self.innerContainer);
                }
                if (self.config.enableTime) {
                    fragment.appendChild(buildTime());
                }
                toggleClass(self.calendarContainer, "rangeMode", self.config.mode === "range");
                toggleClass(self.calendarContainer, "animate", self.config.animate === true);
                toggleClass(self.calendarContainer, "multiMonth", self.config.showMonths > 1);
                self.calendarContainer.appendChild(fragment);
                var customAppend = self.config.appendTo !== undefined &&
                    self.config.appendTo.nodeType !== undefined;
                if (self.config.inline || self.config.static) {
                    self.calendarContainer.classList.add(self.config.inline ? "inline" : "static");
                    if (self.config.inline) {
                        if (!customAppend && self.element.parentNode)
                            self.element.parentNode.insertBefore(self.calendarContainer, self._input.nextSibling);
                        else if (self.config.appendTo !== undefined)
                            self.config.appendTo.appendChild(self.calendarContainer);
                    }
                    if (self.config.static) {
                        var wrapper = createElement("div", "flatpickr-wrapper");
                        if (self.element.parentNode)
                            self.element.parentNode.insertBefore(wrapper, self.element);
                        wrapper.appendChild(self.element);
                        if (self.altInput)
                            wrapper.appendChild(self.altInput);
                        wrapper.appendChild(self.calendarContainer);
                    }
                }
                if (!self.config.static && !self.config.inline)
                    (self.config.appendTo !== undefined
                        ? self.config.appendTo
                        : window.document.body).appendChild(self.calendarContainer);
            }
            function createDay(className, date, dayNumber, i) {
                var dateIsEnabled = isEnabled(date, true), dayElement = createElement("span", "flatpickr-day " + className, date.getDate().toString());
                dayElement.dateObj = date;
                dayElement.$i = i;
                dayElement.setAttribute("aria-label", self.formatDate(date, self.config.ariaDateFormat));
                if (className.indexOf("hidden") === -1 &&
                    compareDates(date, self.now) === 0) {
                    self.todayDateElem = dayElement;
                    dayElement.classList.add("today");
                    dayElement.setAttribute("aria-current", "date");
                }
                if (dateIsEnabled) {
                    dayElement.tabIndex = -1;
                    if (isDateSelected(date)) {
                        dayElement.classList.add("selected");
                        self.selectedDateElem = dayElement;
                        if (self.config.mode === "range") {
                            toggleClass(dayElement, "startRange", self.selectedDates[0] &&
                                compareDates(date, self.selectedDates[0], true) === 0);
                            toggleClass(dayElement, "endRange", self.selectedDates[1] &&
                                compareDates(date, self.selectedDates[1], true) === 0);
                            if (className === "nextMonthDay")
                                dayElement.classList.add("inRange");
                        }
                    }
                }
                else {
                    dayElement.classList.add("flatpickr-disabled");
                }
                if (self.config.mode === "range") {
                    if (isDateInRange(date) && !isDateSelected(date))
                        dayElement.classList.add("inRange");
                }
                if (self.weekNumbers &&
                    self.config.showMonths === 1 &&
                    className !== "prevMonthDay" &&
                    dayNumber % 7 === 1) {
                    self.weekNumbers.insertAdjacentHTML("beforeend", "<span class='flatpickr-day'>" + self.config.getWeek(date) + "</span>");
                }
                triggerEvent("onDayCreate", dayElement);
                return dayElement;
            }
            function focusOnDayElem(targetNode) {
                targetNode.focus();
                if (self.config.mode === "range")
                    onMouseOver(targetNode);
            }
            function getFirstAvailableDay(delta) {
                var startMonth = delta > 0 ? 0 : self.config.showMonths - 1;
                var endMonth = delta > 0 ? self.config.showMonths : -1;
                for (var m = startMonth; m != endMonth; m += delta) {
                    var month = self.daysContainer.children[m];
                    var startIndex = delta > 0 ? 0 : month.children.length - 1;
                    var endIndex = delta > 0 ? month.children.length : -1;
                    for (var i = startIndex; i != endIndex; i += delta) {
                        var c = month.children[i];
                        if (c.className.indexOf("hidden") === -1 && isEnabled(c.dateObj))
                            return c;
                    }
                }
                return undefined;
            }
            function getNextAvailableDay(current, delta) {
                var givenMonth = current.className.indexOf("Month") === -1
                    ? current.dateObj.getMonth()
                    : self.currentMonth;
                var endMonth = delta > 0 ? self.config.showMonths : -1;
                var loopDelta = delta > 0 ? 1 : -1;
                for (var m = givenMonth - self.currentMonth; m != endMonth; m += loopDelta) {
                    var month = self.daysContainer.children[m];
                    var startIndex = givenMonth - self.currentMonth === m
                        ? current.$i + delta
                        : delta < 0
                            ? month.children.length - 1
                            : 0;
                    var numMonthDays = month.children.length;
                    for (var i = startIndex; i >= 0 && i < numMonthDays && i != (delta > 0 ? numMonthDays : -1); i += loopDelta) {
                        var c = month.children[i];
                        if (c.className.indexOf("hidden") === -1 &&
                            isEnabled(c.dateObj) &&
                            Math.abs(current.$i - i) >= Math.abs(delta))
                            return focusOnDayElem(c);
                    }
                }
                self.changeMonth(loopDelta);
                focusOnDay(getFirstAvailableDay(loopDelta), 0);
                return undefined;
            }
            function focusOnDay(current, offset) {
                var dayFocused = isInView(document.activeElement || document.body);
                var startElem = current !== undefined
                    ? current
                    : dayFocused
                        ? document.activeElement
                        : self.selectedDateElem !== undefined && isInView(self.selectedDateElem)
                            ? self.selectedDateElem
                            : self.todayDateElem !== undefined && isInView(self.todayDateElem)
                                ? self.todayDateElem
                                : getFirstAvailableDay(offset > 0 ? 1 : -1);
                if (startElem === undefined) {
                    self._input.focus();
                }
                else if (!dayFocused) {
                    focusOnDayElem(startElem);
                }
                else {
                    getNextAvailableDay(startElem, offset);
                }
            }
            function buildMonthDays(year, month) {
                var firstOfMonth = (new Date(year, month, 1).getDay() - self.l10n.firstDayOfWeek + 7) % 7;
                var prevMonthDays = self.utils.getDaysInMonth((month - 1 + 12) % 12, year);
                var daysInMonth = self.utils.getDaysInMonth(month, year), days = window.document.createDocumentFragment(), isMultiMonth = self.config.showMonths > 1, prevMonthDayClass = isMultiMonth ? "prevMonthDay hidden" : "prevMonthDay", nextMonthDayClass = isMultiMonth ? "nextMonthDay hidden" : "nextMonthDay";
                var dayNumber = prevMonthDays + 1 - firstOfMonth, dayIndex = 0;
                // prepend days from the ending of previous month
                for (; dayNumber <= prevMonthDays; dayNumber++, dayIndex++) {
                    days.appendChild(createDay(prevMonthDayClass, new Date(year, month - 1, dayNumber), dayNumber, dayIndex));
                }
                // Start at 1 since there is no 0th day
                for (dayNumber = 1; dayNumber <= daysInMonth; dayNumber++, dayIndex++) {
                    days.appendChild(createDay("", new Date(year, month, dayNumber), dayNumber, dayIndex));
                }
                // append days from the next month
                for (var dayNum = daysInMonth + 1; dayNum <= 42 - firstOfMonth &&
                    (self.config.showMonths === 1 || dayIndex % 7 !== 0); dayNum++, dayIndex++) {
                    days.appendChild(createDay(nextMonthDayClass, new Date(year, month + 1, dayNum % daysInMonth), dayNum, dayIndex));
                }
                //updateNavigationCurrentMonth();
                var dayContainer = createElement("div", "dayContainer");
                dayContainer.appendChild(days);
                return dayContainer;
            }
            function buildDays() {
                if (self.daysContainer === undefined) {
                    return;
                }
                clearNode(self.daysContainer);
                // TODO: week numbers for each month
                if (self.weekNumbers)
                    clearNode(self.weekNumbers);
                var frag = document.createDocumentFragment();
                for (var i = 0; i < self.config.showMonths; i++) {
                    var d = new Date(self.currentYear, self.currentMonth, 1);
                    d.setMonth(self.currentMonth + i);
                    frag.appendChild(buildMonthDays(d.getFullYear(), d.getMonth()));
                }
                self.daysContainer.appendChild(frag);
                self.days = self.daysContainer.firstChild;
                if (self.config.mode === "range" && self.selectedDates.length === 1) {
                    onMouseOver();
                }
            }
            function buildMonthSwitch() {
                if (self.config.showMonths > 1 ||
                    self.config.monthSelectorType !== "dropdown")
                    return;
                var shouldBuildMonth = function (month) {
                    if (self.config.minDate !== undefined &&
                        self.currentYear === self.config.minDate.getFullYear() &&
                        month < self.config.minDate.getMonth()) {
                        return false;
                    }
                    return !(self.config.maxDate !== undefined &&
                        self.currentYear === self.config.maxDate.getFullYear() &&
                        month > self.config.maxDate.getMonth());
                };
                self.monthsDropdownContainer.tabIndex = -1;
                self.monthsDropdownContainer.innerHTML = "";
                for (var i = 0; i < 12; i++) {
                    if (!shouldBuildMonth(i))
                        continue;
                    var month = createElement("option", "flatpickr-monthDropdown-month");
                    month.value = new Date(self.currentYear, i).getMonth().toString();
                    month.textContent = monthToStr(i, self.config.shorthandCurrentMonth, self.l10n);
                    month.tabIndex = -1;
                    if (self.currentMonth === i) {
                        month.selected = true;
                    }
                    self.monthsDropdownContainer.appendChild(month);
                }
            }
            function buildMonth() {
                var container = createElement("div", "flatpickr-month");
                var monthNavFragment = window.document.createDocumentFragment();
                var monthElement;
                if (self.config.showMonths > 1 ||
                    self.config.monthSelectorType === "static") {
                    monthElement = createElement("span", "cur-month");
                }
                else {
                    self.monthsDropdownContainer = createElement("select", "flatpickr-monthDropdown-months");
                    self.monthsDropdownContainer.setAttribute("aria-label", self.l10n.monthAriaLabel);
                    bind(self.monthsDropdownContainer, "change", function (e) {
                        var target = getEventTarget(e);
                        var selectedMonth = parseInt(target.value, 10);
                        self.changeMonth(selectedMonth - self.currentMonth);
                        triggerEvent("onMonthChange");
                    });
                    buildMonthSwitch();
                    monthElement = self.monthsDropdownContainer;
                }
                var yearInput = createNumberInput("cur-year", { tabindex: "-1" });
                var yearElement = yearInput.getElementsByTagName("input")[0];
                yearElement.setAttribute("aria-label", self.l10n.yearAriaLabel);
                if (self.config.minDate) {
                    yearElement.setAttribute("min", self.config.minDate.getFullYear().toString());
                }
                if (self.config.maxDate) {
                    yearElement.setAttribute("max", self.config.maxDate.getFullYear().toString());
                    yearElement.disabled =
                        !!self.config.minDate &&
                            self.config.minDate.getFullYear() === self.config.maxDate.getFullYear();
                }
                var currentMonth = createElement("div", "flatpickr-current-month");
                currentMonth.appendChild(monthElement);
                currentMonth.appendChild(yearInput);
                monthNavFragment.appendChild(currentMonth);
                container.appendChild(monthNavFragment);
                return {
                    container: container,
                    yearElement: yearElement,
                    monthElement: monthElement,
                };
            }
            function buildMonths() {
                clearNode(self.monthNav);
                self.monthNav.appendChild(self.prevMonthNav);
                if (self.config.showMonths) {
                    self.yearElements = [];
                    self.monthElements = [];
                }
                for (var m = self.config.showMonths; m--;) {
                    var month = buildMonth();
                    self.yearElements.push(month.yearElement);
                    self.monthElements.push(month.monthElement);
                    self.monthNav.appendChild(month.container);
                }
                self.monthNav.appendChild(self.nextMonthNav);
            }
            function buildMonthNav() {
                self.monthNav = createElement("div", "flatpickr-months");
                self.yearElements = [];
                self.monthElements = [];
                self.prevMonthNav = createElement("span", "flatpickr-prev-month");
                self.prevMonthNav.innerHTML = self.config.prevArrow;
                self.nextMonthNav = createElement("span", "flatpickr-next-month");
                self.nextMonthNav.innerHTML = self.config.nextArrow;
                buildMonths();
                Object.defineProperty(self, "_hidePrevMonthArrow", {
                    get: function () { return self.__hidePrevMonthArrow; },
                    set: function (bool) {
                        if (self.__hidePrevMonthArrow !== bool) {
                            toggleClass(self.prevMonthNav, "flatpickr-disabled", bool);
                            self.__hidePrevMonthArrow = bool;
                        }
                    },
                });
                Object.defineProperty(self, "_hideNextMonthArrow", {
                    get: function () { return self.__hideNextMonthArrow; },
                    set: function (bool) {
                        if (self.__hideNextMonthArrow !== bool) {
                            toggleClass(self.nextMonthNav, "flatpickr-disabled", bool);
                            self.__hideNextMonthArrow = bool;
                        }
                    },
                });
                self.currentYearElement = self.yearElements[0];
                updateNavigationCurrentMonth();
                return self.monthNav;
            }
            function buildTime() {
                self.calendarContainer.classList.add("hasTime");
                if (self.config.noCalendar)
                    self.calendarContainer.classList.add("noCalendar");
                self.timeContainer = createElement("div", "flatpickr-time");
                self.timeContainer.tabIndex = -1;
                var separator = createElement("span", "flatpickr-time-separator", ":");
                var hourInput = createNumberInput("flatpickr-hour", {
                    "aria-label": self.l10n.hourAriaLabel,
                });
                self.hourElement = hourInput.getElementsByTagName("input")[0];
                var minuteInput = createNumberInput("flatpickr-minute", {
                    "aria-label": self.l10n.minuteAriaLabel,
                });
                self.minuteElement = minuteInput.getElementsByTagName("input")[0];
                self.hourElement.tabIndex = self.minuteElement.tabIndex = -1;
                self.hourElement.value = pad(self.latestSelectedDateObj
                    ? self.latestSelectedDateObj.getHours()
                    : self.config.time_24hr
                        ? self.config.defaultHour
                        : military2ampm(self.config.defaultHour));
                self.minuteElement.value = pad(self.latestSelectedDateObj
                    ? self.latestSelectedDateObj.getMinutes()
                    : self.config.defaultMinute);
                self.hourElement.setAttribute("step", self.config.hourIncrement.toString());
                self.minuteElement.setAttribute("step", self.config.minuteIncrement.toString());
                self.hourElement.setAttribute("min", self.config.time_24hr ? "0" : "1");
                self.hourElement.setAttribute("max", self.config.time_24hr ? "23" : "12");
                self.minuteElement.setAttribute("min", "0");
                self.minuteElement.setAttribute("max", "59");
                self.timeContainer.appendChild(hourInput);
                self.timeContainer.appendChild(separator);
                self.timeContainer.appendChild(minuteInput);
                if (self.config.time_24hr)
                    self.timeContainer.classList.add("time24hr");
                if (self.config.enableSeconds) {
                    self.timeContainer.classList.add("hasSeconds");
                    var secondInput = createNumberInput("flatpickr-second");
                    self.secondElement = secondInput.getElementsByTagName("input")[0];
                    self.secondElement.value = pad(self.latestSelectedDateObj
                        ? self.latestSelectedDateObj.getSeconds()
                        : self.config.defaultSeconds);
                    self.secondElement.setAttribute("step", self.minuteElement.getAttribute("step"));
                    self.secondElement.setAttribute("min", "0");
                    self.secondElement.setAttribute("max", "59");
                    self.timeContainer.appendChild(createElement("span", "flatpickr-time-separator", ":"));
                    self.timeContainer.appendChild(secondInput);
                }
                if (!self.config.time_24hr) {
                    // add self.amPM if appropriate
                    self.amPM = createElement("span", "flatpickr-am-pm", self.l10n.amPM[int((self.latestSelectedDateObj
                        ? self.hourElement.value
                        : self.config.defaultHour) > 11)]);
                    self.amPM.title = self.l10n.toggleTitle;
                    self.amPM.tabIndex = -1;
                    self.timeContainer.appendChild(self.amPM);
                }
                return self.timeContainer;
            }
            function buildWeekdays() {
                if (!self.weekdayContainer)
                    self.weekdayContainer = createElement("div", "flatpickr-weekdays");
                else
                    clearNode(self.weekdayContainer);
                for (var i = self.config.showMonths; i--;) {
                    var container = createElement("div", "flatpickr-weekdaycontainer");
                    self.weekdayContainer.appendChild(container);
                }
                updateWeekdays();
                return self.weekdayContainer;
            }
            function updateWeekdays() {
                if (!self.weekdayContainer) {
                    return;
                }
                var firstDayOfWeek = self.l10n.firstDayOfWeek;
                var weekdays = __spreadArrays(self.l10n.weekdays.shorthand);
                if (firstDayOfWeek > 0 && firstDayOfWeek < weekdays.length) {
                    weekdays = __spreadArrays(weekdays.splice(firstDayOfWeek, weekdays.length), weekdays.splice(0, firstDayOfWeek));
                }
                for (var i = self.config.showMonths; i--;) {
                    self.weekdayContainer.children[i].innerHTML = "\n      <span class='flatpickr-weekday'>\n        " + weekdays.join("</span><span class='flatpickr-weekday'>") + "\n      </span>\n      ";
                }
            }
            /* istanbul ignore next */
            function buildWeeks() {
                self.calendarContainer.classList.add("hasWeeks");
                var weekWrapper = createElement("div", "flatpickr-weekwrapper");
                weekWrapper.appendChild(createElement("span", "flatpickr-weekday", self.l10n.weekAbbreviation));
                var weekNumbers = createElement("div", "flatpickr-weeks");
                weekWrapper.appendChild(weekNumbers);
                return {
                    weekWrapper: weekWrapper,
                    weekNumbers: weekNumbers,
                };
            }
            function changeMonth(value, isOffset) {
                if (isOffset === void 0) { isOffset = true; }
                var delta = isOffset ? value : value - self.currentMonth;
                if ((delta < 0 && self._hidePrevMonthArrow === true) ||
                    (delta > 0 && self._hideNextMonthArrow === true))
                    return;
                self.currentMonth += delta;
                if (self.currentMonth < 0 || self.currentMonth > 11) {
                    self.currentYear += self.currentMonth > 11 ? 1 : -1;
                    self.currentMonth = (self.currentMonth + 12) % 12;
                    triggerEvent("onYearChange");
                    buildMonthSwitch();
                }
                buildDays();
                triggerEvent("onMonthChange");
                updateNavigationCurrentMonth();
            }
            function clear(triggerChangeEvent, toInitial) {
                if (triggerChangeEvent === void 0) { triggerChangeEvent = true; }
                if (toInitial === void 0) { toInitial = true; }
                self.input.value = "";
                if (self.altInput !== undefined)
                    self.altInput.value = "";
                if (self.mobileInput !== undefined)
                    self.mobileInput.value = "";
                self.selectedDates = [];
                self.latestSelectedDateObj = undefined;
                if (toInitial === true) {
                    self.currentYear = self._initialDate.getFullYear();
                    self.currentMonth = self._initialDate.getMonth();
                }
                if (self.config.enableTime === true) {
                    var _a = getDefaultHours(), hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds;
                    setHours(hours, minutes, seconds);
                }
                self.redraw();
                if (triggerChangeEvent)
                    // triggerChangeEvent is true (default) or an Event
                    triggerEvent("onChange");
            }
            function close() {
                self.isOpen = false;
                if (!self.isMobile) {
                    if (self.calendarContainer !== undefined) {
                        self.calendarContainer.classList.remove("open");
                    }
                    if (self._input !== undefined) {
                        self._input.classList.remove("active");
                    }
                }
                triggerEvent("onClose");
            }
            function destroy() {
                if (self.config !== undefined)
                    triggerEvent("onDestroy");
                for (var i = self._handlers.length; i--;) {
                    var h = self._handlers[i];
                    h.element.removeEventListener(h.event, h.handler, h.options);
                }
                self._handlers = [];
                if (self.mobileInput) {
                    if (self.mobileInput.parentNode)
                        self.mobileInput.parentNode.removeChild(self.mobileInput);
                    self.mobileInput = undefined;
                }
                else if (self.calendarContainer && self.calendarContainer.parentNode) {
                    if (self.config.static && self.calendarContainer.parentNode) {
                        var wrapper = self.calendarContainer.parentNode;
                        wrapper.lastChild && wrapper.removeChild(wrapper.lastChild);
                        if (wrapper.parentNode) {
                            while (wrapper.firstChild)
                                wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
                            wrapper.parentNode.removeChild(wrapper);
                        }
                    }
                    else
                        self.calendarContainer.parentNode.removeChild(self.calendarContainer);
                }
                if (self.altInput) {
                    self.input.type = "text";
                    if (self.altInput.parentNode)
                        self.altInput.parentNode.removeChild(self.altInput);
                    delete self.altInput;
                }
                if (self.input) {
                    self.input.type = self.input._type;
                    self.input.classList.remove("flatpickr-input");
                    self.input.removeAttribute("readonly");
                }
                [
                    "_showTimeInput",
                    "latestSelectedDateObj",
                    "_hideNextMonthArrow",
                    "_hidePrevMonthArrow",
                    "__hideNextMonthArrow",
                    "__hidePrevMonthArrow",
                    "isMobile",
                    "isOpen",
                    "selectedDateElem",
                    "minDateHasTime",
                    "maxDateHasTime",
                    "days",
                    "daysContainer",
                    "_input",
                    "_positionElement",
                    "innerContainer",
                    "rContainer",
                    "monthNav",
                    "todayDateElem",
                    "calendarContainer",
                    "weekdayContainer",
                    "prevMonthNav",
                    "nextMonthNav",
                    "monthsDropdownContainer",
                    "currentMonthElement",
                    "currentYearElement",
                    "navigationCurrentMonth",
                    "selectedDateElem",
                    "config",
                ].forEach(function (k) {
                    try {
                        delete self[k];
                    }
                    catch (_) { }
                });
            }
            function isCalendarElem(elem) {
                if (self.config.appendTo && self.config.appendTo.contains(elem))
                    return true;
                return self.calendarContainer.contains(elem);
            }
            function documentClick(e) {
                if (self.isOpen && !self.config.inline) {
                    var eventTarget_1 = getEventTarget(e);
                    var isCalendarElement = isCalendarElem(eventTarget_1);
                    var isInput = eventTarget_1 === self.input ||
                        eventTarget_1 === self.altInput ||
                        self.element.contains(eventTarget_1) ||
                        // web components
                        // e.path is not present in all browsers. circumventing typechecks
                        (e.path &&
                            e.path.indexOf &&
                            (~e.path.indexOf(self.input) ||
                                ~e.path.indexOf(self.altInput)));
                    var lostFocus = e.type === "blur"
                        ? isInput &&
                            e.relatedTarget &&
                            !isCalendarElem(e.relatedTarget)
                        : !isInput &&
                            !isCalendarElement &&
                            !isCalendarElem(e.relatedTarget);
                    var isIgnored = !self.config.ignoredFocusElements.some(function (elem) {
                        return elem.contains(eventTarget_1);
                    });
                    if (lostFocus && isIgnored) {
                        if (self.timeContainer !== undefined &&
                            self.minuteElement !== undefined &&
                            self.hourElement !== undefined &&
                            self.input.value !== "" &&
                            self.input.value !== undefined) {
                            updateTime();
                        }
                        self.close();
                        if (self.config &&
                            self.config.mode === "range" &&
                            self.selectedDates.length === 1) {
                            self.clear(false);
                            self.redraw();
                        }
                    }
                }
            }
            function changeYear(newYear) {
                if (!newYear ||
                    (self.config.minDate && newYear < self.config.minDate.getFullYear()) ||
                    (self.config.maxDate && newYear > self.config.maxDate.getFullYear()))
                    return;
                var newYearNum = newYear, isNewYear = self.currentYear !== newYearNum;
                self.currentYear = newYearNum || self.currentYear;
                if (self.config.maxDate &&
                    self.currentYear === self.config.maxDate.getFullYear()) {
                    self.currentMonth = Math.min(self.config.maxDate.getMonth(), self.currentMonth);
                }
                else if (self.config.minDate &&
                    self.currentYear === self.config.minDate.getFullYear()) {
                    self.currentMonth = Math.max(self.config.minDate.getMonth(), self.currentMonth);
                }
                if (isNewYear) {
                    self.redraw();
                    triggerEvent("onYearChange");
                    buildMonthSwitch();
                }
            }
            function isEnabled(date, timeless) {
                if (timeless === void 0) { timeless = true; }
                var dateToCheck = self.parseDate(date, undefined, timeless); // timeless
                if ((self.config.minDate &&
                    dateToCheck &&
                    compareDates(dateToCheck, self.config.minDate, timeless !== undefined ? timeless : !self.minDateHasTime) < 0) ||
                    (self.config.maxDate &&
                        dateToCheck &&
                        compareDates(dateToCheck, self.config.maxDate, timeless !== undefined ? timeless : !self.maxDateHasTime) > 0))
                    return false;
                if (self.config.enable.length === 0 && self.config.disable.length === 0)
                    return true;
                if (dateToCheck === undefined)
                    return false;
                var bool = self.config.enable.length > 0, array = bool ? self.config.enable : self.config.disable;
                for (var i = 0, d = void 0; i < array.length; i++) {
                    d = array[i];
                    if (typeof d === "function" &&
                        d(dateToCheck) // disabled by function
                    )
                        return bool;
                    else if (d instanceof Date &&
                        dateToCheck !== undefined &&
                        d.getTime() === dateToCheck.getTime())
                        // disabled by date
                        return bool;
                    else if (typeof d === "string" && dateToCheck !== undefined) {
                        // disabled by date string
                        var parsed = self.parseDate(d, undefined, true);
                        return parsed && parsed.getTime() === dateToCheck.getTime()
                            ? bool
                            : !bool;
                    }
                    else if (
                    // disabled by range
                    typeof d === "object" &&
                        dateToCheck !== undefined &&
                        d.from &&
                        d.to &&
                        dateToCheck.getTime() >= d.from.getTime() &&
                        dateToCheck.getTime() <= d.to.getTime())
                        return bool;
                }
                return !bool;
            }
            function isInView(elem) {
                if (self.daysContainer !== undefined)
                    return (elem.className.indexOf("hidden") === -1 &&
                        elem.className.indexOf("flatpickr-disabled") === -1 &&
                        self.daysContainer.contains(elem));
                return false;
            }
            function onBlur(e) {
                var isInput = e.target === self._input;
                if (isInput &&
                    !(e.relatedTarget && isCalendarElem(e.relatedTarget))) {
                    self.setDate(self._input.value, true, e.target === self.altInput
                        ? self.config.altFormat
                        : self.config.dateFormat);
                }
            }
            function onKeyDown(e) {
                // e.key                      e.keyCode
                // "Backspace"                        8
                // "Tab"                              9
                // "Enter"                           13
                // "Escape"     (IE "Esc")           27
                // "ArrowLeft"  (IE "Left")          37
                // "ArrowUp"    (IE "Up")            38
                // "ArrowRight" (IE "Right")         39
                // "ArrowDown"  (IE "Down")          40
                // "Delete"     (IE "Del")           46
                var eventTarget = getEventTarget(e);
                var isInput = self.config.wrap
                    ? element.contains(eventTarget)
                    : eventTarget === self._input;
                var allowInput = self.config.allowInput;
                var allowKeydown = self.isOpen && (!allowInput || !isInput);
                var allowInlineKeydown = self.config.inline && isInput && !allowInput;
                if (e.keyCode === 13 && isInput) {
                    if (allowInput) {
                        self.setDate(self._input.value, true, eventTarget === self.altInput
                            ? self.config.altFormat
                            : self.config.dateFormat);
                        return eventTarget.blur();
                    }
                    else {
                        self.open();
                    }
                }
                else if (isCalendarElem(eventTarget) ||
                    allowKeydown ||
                    allowInlineKeydown) {
                    var isTimeObj = !!self.timeContainer &&
                        self.timeContainer.contains(eventTarget);
                    switch (e.keyCode) {
                        case 13:
                            if (isTimeObj) {
                                e.preventDefault();
                                updateTime();
                                focusAndClose();
                            }
                            else
                                selectDate(e);
                            break;
                        case 27: // escape
                            e.preventDefault();
                            focusAndClose();
                            break;
                        case 8:
                        case 46:
                            if (isInput && !self.config.allowInput) {
                                e.preventDefault();
                                self.clear();
                            }
                            break;
                        case 37:
                        case 39:
                            if (!isTimeObj && !isInput) {
                                e.preventDefault();
                                if (self.daysContainer !== undefined &&
                                    (allowInput === false ||
                                        (document.activeElement && isInView(document.activeElement)))) {
                                    var delta_1 = e.keyCode === 39 ? 1 : -1;
                                    if (!e.ctrlKey)
                                        focusOnDay(undefined, delta_1);
                                    else {
                                        e.stopPropagation();
                                        changeMonth(delta_1);
                                        focusOnDay(getFirstAvailableDay(1), 0);
                                    }
                                }
                            }
                            else if (self.hourElement)
                                self.hourElement.focus();
                            break;
                        case 38:
                        case 40:
                            e.preventDefault();
                            var delta = e.keyCode === 40 ? 1 : -1;
                            if ((self.daysContainer &&
                                eventTarget.$i !== undefined) ||
                                eventTarget === self.input ||
                                eventTarget === self.altInput) {
                                if (e.ctrlKey) {
                                    e.stopPropagation();
                                    changeYear(self.currentYear - delta);
                                    focusOnDay(getFirstAvailableDay(1), 0);
                                }
                                else if (!isTimeObj)
                                    focusOnDay(undefined, delta * 7);
                            }
                            else if (eventTarget === self.currentYearElement) {
                                changeYear(self.currentYear - delta);
                            }
                            else if (self.config.enableTime) {
                                if (!isTimeObj && self.hourElement)
                                    self.hourElement.focus();
                                updateTime(e);
                                self._debouncedChange();
                            }
                            break;
                        case 9:
                            if (isTimeObj) {
                                var elems = [
                                    self.hourElement,
                                    self.minuteElement,
                                    self.secondElement,
                                    self.amPM,
                                ]
                                    .concat(self.pluginElements)
                                    .filter(function (x) { return x; });
                                var i = elems.indexOf(eventTarget);
                                if (i !== -1) {
                                    var target = elems[i + (e.shiftKey ? -1 : 1)];
                                    e.preventDefault();
                                    (target || self._input).focus();
                                }
                            }
                            else if (!self.config.noCalendar &&
                                self.daysContainer &&
                                self.daysContainer.contains(eventTarget) &&
                                e.shiftKey) {
                                e.preventDefault();
                                self._input.focus();
                            }
                            break;
                    }
                }
                if (self.amPM !== undefined && eventTarget === self.amPM) {
                    switch (e.key) {
                        case self.l10n.amPM[0].charAt(0):
                        case self.l10n.amPM[0].charAt(0).toLowerCase():
                            self.amPM.textContent = self.l10n.amPM[0];
                            setHoursFromInputs();
                            updateValue();
                            break;
                        case self.l10n.amPM[1].charAt(0):
                        case self.l10n.amPM[1].charAt(0).toLowerCase():
                            self.amPM.textContent = self.l10n.amPM[1];
                            setHoursFromInputs();
                            updateValue();
                            break;
                    }
                }
                if (isInput || isCalendarElem(eventTarget)) {
                    triggerEvent("onKeyDown", e);
                }
            }
            function onMouseOver(elem) {
                if (self.selectedDates.length !== 1 ||
                    (elem &&
                        (!elem.classList.contains("flatpickr-day") ||
                            elem.classList.contains("flatpickr-disabled"))))
                    return;
                var hoverDate = elem
                    ? elem.dateObj.getTime()
                    : self.days.firstElementChild.dateObj.getTime(), initialDate = self.parseDate(self.selectedDates[0], undefined, true).getTime(), rangeStartDate = Math.min(hoverDate, self.selectedDates[0].getTime()), rangeEndDate = Math.max(hoverDate, self.selectedDates[0].getTime());
                var containsDisabled = false;
                var minRange = 0, maxRange = 0;
                for (var t = rangeStartDate; t < rangeEndDate; t += duration.DAY) {
                    if (!isEnabled(new Date(t), true)) {
                        containsDisabled =
                            containsDisabled || (t > rangeStartDate && t < rangeEndDate);
                        if (t < initialDate && (!minRange || t > minRange))
                            minRange = t;
                        else if (t > initialDate && (!maxRange || t < maxRange))
                            maxRange = t;
                    }
                }
                for (var m = 0; m < self.config.showMonths; m++) {
                    var month = self.daysContainer.children[m];
                    var _loop_1 = function (i, l) {
                        var dayElem = month.children[i], date = dayElem.dateObj;
                        var timestamp = date.getTime();
                        var outOfRange = (minRange > 0 && timestamp < minRange) ||
                            (maxRange > 0 && timestamp > maxRange);
                        if (outOfRange) {
                            dayElem.classList.add("notAllowed");
                            ["inRange", "startRange", "endRange"].forEach(function (c) {
                                dayElem.classList.remove(c);
                            });
                            return "continue";
                        }
                        else if (containsDisabled && !outOfRange)
                            return "continue";
                        ["startRange", "inRange", "endRange", "notAllowed"].forEach(function (c) {
                            dayElem.classList.remove(c);
                        });
                        if (elem !== undefined) {
                            elem.classList.add(hoverDate <= self.selectedDates[0].getTime()
                                ? "startRange"
                                : "endRange");
                            if (initialDate < hoverDate && timestamp === initialDate)
                                dayElem.classList.add("startRange");
                            else if (initialDate > hoverDate && timestamp === initialDate)
                                dayElem.classList.add("endRange");
                            if (timestamp >= minRange &&
                                (maxRange === 0 || timestamp <= maxRange) &&
                                isBetween(timestamp, initialDate, hoverDate))
                                dayElem.classList.add("inRange");
                        }
                    };
                    for (var i = 0, l = month.children.length; i < l; i++) {
                        _loop_1(i, l);
                    }
                }
            }
            function onResize() {
                if (self.isOpen && !self.config.static && !self.config.inline)
                    positionCalendar();
            }
            function open(e, positionElement) {
                if (positionElement === void 0) { positionElement = self._positionElement; }
                if (self.isMobile === true) {
                    if (e) {
                        e.preventDefault();
                        var eventTarget = getEventTarget(e);
                        eventTarget && eventTarget.blur();
                    }
                    if (self.mobileInput !== undefined) {
                        self.mobileInput.focus();
                        self.mobileInput.click();
                    }
                    triggerEvent("onOpen");
                    return;
                }
                if (self._input.disabled || self.config.inline)
                    return;
                var wasOpen = self.isOpen;
                self.isOpen = true;
                if (!wasOpen) {
                    self.calendarContainer.classList.add("open");
                    self._input.classList.add("active");
                    triggerEvent("onOpen");
                    positionCalendar(positionElement);
                }
                if (self.config.enableTime === true && self.config.noCalendar === true) {
                    if (self.config.allowInput === false &&
                        (e === undefined ||
                            !self.timeContainer.contains(e.relatedTarget))) {
                        setTimeout(function () { return self.hourElement.select(); }, 50);
                    }
                }
            }
            function minMaxDateSetter(type) {
                return function (date) {
                    var dateObj = (self.config["_" + type + "Date"] = self.parseDate(date, self.config.dateFormat));
                    var inverseDateObj = self.config["_" + (type === "min" ? "max" : "min") + "Date"];
                    if (dateObj !== undefined) {
                        self[type === "min" ? "minDateHasTime" : "maxDateHasTime"] =
                            dateObj.getHours() > 0 ||
                                dateObj.getMinutes() > 0 ||
                                dateObj.getSeconds() > 0;
                    }
                    if (self.selectedDates) {
                        self.selectedDates = self.selectedDates.filter(function (d) { return isEnabled(d); });
                        if (!self.selectedDates.length && type === "min")
                            setHoursFromDate(dateObj);
                        updateValue();
                    }
                    if (self.daysContainer) {
                        redraw();
                        if (dateObj !== undefined)
                            self.currentYearElement[type] = dateObj.getFullYear().toString();
                        else
                            self.currentYearElement.removeAttribute(type);
                        self.currentYearElement.disabled =
                            !!inverseDateObj &&
                                dateObj !== undefined &&
                                inverseDateObj.getFullYear() === dateObj.getFullYear();
                    }
                };
            }
            function parseConfig() {
                var boolOpts = [
                    "wrap",
                    "weekNumbers",
                    "allowInput",
                    "allowInvalidPreload",
                    "clickOpens",
                    "time_24hr",
                    "enableTime",
                    "noCalendar",
                    "altInput",
                    "shorthandCurrentMonth",
                    "inline",
                    "static",
                    "enableSeconds",
                    "disableMobile",
                ];
                var userConfig = __assign(__assign({}, JSON.parse(JSON.stringify(element.dataset || {}))), instanceConfig);
                var formats = {};
                self.config.parseDate = userConfig.parseDate;
                self.config.formatDate = userConfig.formatDate;
                Object.defineProperty(self.config, "enable", {
                    get: function () { return self.config._enable; },
                    set: function (dates) {
                        self.config._enable = parseDateRules(dates);
                    },
                });
                Object.defineProperty(self.config, "disable", {
                    get: function () { return self.config._disable; },
                    set: function (dates) {
                        self.config._disable = parseDateRules(dates);
                    },
                });
                var timeMode = userConfig.mode === "time";
                if (!userConfig.dateFormat && (userConfig.enableTime || timeMode)) {
                    var defaultDateFormat = flatpickr.defaultConfig.dateFormat || defaults.dateFormat;
                    formats.dateFormat =
                        userConfig.noCalendar || timeMode
                            ? "H:i" + (userConfig.enableSeconds ? ":S" : "")
                            : defaultDateFormat + " H:i" + (userConfig.enableSeconds ? ":S" : "");
                }
                if (userConfig.altInput &&
                    (userConfig.enableTime || timeMode) &&
                    !userConfig.altFormat) {
                    var defaultAltFormat = flatpickr.defaultConfig.altFormat || defaults.altFormat;
                    formats.altFormat =
                        userConfig.noCalendar || timeMode
                            ? "h:i" + (userConfig.enableSeconds ? ":S K" : " K")
                            : defaultAltFormat + (" h:i" + (userConfig.enableSeconds ? ":S" : "") + " K");
                }
                Object.defineProperty(self.config, "minDate", {
                    get: function () { return self.config._minDate; },
                    set: minMaxDateSetter("min"),
                });
                Object.defineProperty(self.config, "maxDate", {
                    get: function () { return self.config._maxDate; },
                    set: minMaxDateSetter("max"),
                });
                var minMaxTimeSetter = function (type) { return function (val) {
                    self.config[type === "min" ? "_minTime" : "_maxTime"] = self.parseDate(val, "H:i:S");
                }; };
                Object.defineProperty(self.config, "minTime", {
                    get: function () { return self.config._minTime; },
                    set: minMaxTimeSetter("min"),
                });
                Object.defineProperty(self.config, "maxTime", {
                    get: function () { return self.config._maxTime; },
                    set: minMaxTimeSetter("max"),
                });
                if (userConfig.mode === "time") {
                    self.config.noCalendar = true;
                    self.config.enableTime = true;
                }
                Object.assign(self.config, formats, userConfig);
                for (var i = 0; i < boolOpts.length; i++)
                    // https://github.com/microsoft/TypeScript/issues/31663
                    self.config[boolOpts[i]] =
                        self.config[boolOpts[i]] === true ||
                            self.config[boolOpts[i]] === "true";
                HOOKS.filter(function (hook) { return self.config[hook] !== undefined; }).forEach(function (hook) {
                    self.config[hook] = arrayify(self.config[hook] || []).map(bindToInstance);
                });
                self.isMobile =
                    !self.config.disableMobile &&
                        !self.config.inline &&
                        self.config.mode === "single" &&
                        !self.config.disable.length &&
                        !self.config.enable.length &&
                        !self.config.weekNumbers &&
                        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                for (var i = 0; i < self.config.plugins.length; i++) {
                    var pluginConf = self.config.plugins[i](self) || {};
                    for (var key in pluginConf) {
                        if (HOOKS.indexOf(key) > -1) {
                            self.config[key] = arrayify(pluginConf[key])
                                .map(bindToInstance)
                                .concat(self.config[key]);
                        }
                        else if (typeof userConfig[key] === "undefined")
                            self.config[key] = pluginConf[key];
                    }
                }
                if (!userConfig.altInputClass) {
                    self.config.altInputClass =
                        getInputElem().className + " " + self.config.altInputClass;
                }
                triggerEvent("onParseConfig");
            }
            function getInputElem() {
                return self.config.wrap
                    ? element.querySelector("[data-input]")
                    : element;
            }
            function setupLocale() {
                if (typeof self.config.locale !== "object" &&
                    typeof flatpickr.l10ns[self.config.locale] === "undefined")
                    self.config.errorHandler(new Error("flatpickr: invalid locale " + self.config.locale));
                self.l10n = __assign(__assign({}, flatpickr.l10ns.default), (typeof self.config.locale === "object"
                    ? self.config.locale
                    : self.config.locale !== "default"
                        ? flatpickr.l10ns[self.config.locale]
                        : undefined));
                tokenRegex.K = "(" + self.l10n.amPM[0] + "|" + self.l10n.amPM[1] + "|" + self.l10n.amPM[0].toLowerCase() + "|" + self.l10n.amPM[1].toLowerCase() + ")";
                var userConfig = __assign(__assign({}, instanceConfig), JSON.parse(JSON.stringify(element.dataset || {})));
                if (userConfig.time_24hr === undefined &&
                    flatpickr.defaultConfig.time_24hr === undefined) {
                    self.config.time_24hr = self.l10n.time_24hr;
                }
                self.formatDate = createDateFormatter(self);
                self.parseDate = createDateParser({ config: self.config, l10n: self.l10n });
            }
            function positionCalendar(customPositionElement) {
                if (self.calendarContainer === undefined)
                    return;
                triggerEvent("onPreCalendarPosition");
                var positionElement = customPositionElement || self._positionElement;
                var calendarHeight = Array.prototype.reduce.call(self.calendarContainer.children, (function (acc, child) { return acc + child.offsetHeight; }), 0), calendarWidth = self.calendarContainer.offsetWidth, configPos = self.config.position.split(" "), configPosVertical = configPos[0], configPosHorizontal = configPos.length > 1 ? configPos[1] : null, inputBounds = positionElement.getBoundingClientRect(), distanceFromBottom = window.innerHeight - inputBounds.bottom, showOnTop = configPosVertical === "above" ||
                    (configPosVertical !== "below" &&
                        distanceFromBottom < calendarHeight &&
                        inputBounds.top > calendarHeight);
                var top = window.pageYOffset +
                    inputBounds.top +
                    (!showOnTop ? positionElement.offsetHeight + 2 : -calendarHeight - 2);
                toggleClass(self.calendarContainer, "arrowTop", !showOnTop);
                toggleClass(self.calendarContainer, "arrowBottom", showOnTop);
                if (self.config.inline)
                    return;
                var left = window.pageXOffset + inputBounds.left;
                var isCenter = false;
                var isRight = false;
                if (configPosHorizontal === "center") {
                    left -= (calendarWidth - inputBounds.width) / 2;
                    isCenter = true;
                }
                else if (configPosHorizontal === "right") {
                    left -= calendarWidth - inputBounds.width;
                    isRight = true;
                }
                toggleClass(self.calendarContainer, "arrowLeft", !isCenter && !isRight);
                toggleClass(self.calendarContainer, "arrowCenter", isCenter);
                toggleClass(self.calendarContainer, "arrowRight", isRight);
                var right = window.document.body.offsetWidth -
                    (window.pageXOffset + inputBounds.right);
                var rightMost = left + calendarWidth > window.document.body.offsetWidth;
                var centerMost = right + calendarWidth > window.document.body.offsetWidth;
                toggleClass(self.calendarContainer, "rightMost", rightMost);
                if (self.config.static)
                    return;
                self.calendarContainer.style.top = top + "px";
                if (!rightMost) {
                    self.calendarContainer.style.left = left + "px";
                    self.calendarContainer.style.right = "auto";
                }
                else if (!centerMost) {
                    self.calendarContainer.style.left = "auto";
                    self.calendarContainer.style.right = right + "px";
                }
                else {
                    var doc = getDocumentStyleSheet();
                    // some testing environments don't have css support
                    if (doc === undefined)
                        return;
                    var bodyWidth = window.document.body.offsetWidth;
                    var centerLeft = Math.max(0, bodyWidth / 2 - calendarWidth / 2);
                    var centerBefore = ".flatpickr-calendar.centerMost:before";
                    var centerAfter = ".flatpickr-calendar.centerMost:after";
                    var centerIndex = doc.cssRules.length;
                    var centerStyle = "{left:" + inputBounds.left + "px;right:auto;}";
                    toggleClass(self.calendarContainer, "rightMost", false);
                    toggleClass(self.calendarContainer, "centerMost", true);
                    doc.insertRule(centerBefore + "," + centerAfter + centerStyle, centerIndex);
                    self.calendarContainer.style.left = centerLeft + "px";
                    self.calendarContainer.style.right = "auto";
                }
            }
            function getDocumentStyleSheet() {
                var editableSheet = null;
                for (var i = 0; i < document.styleSheets.length; i++) {
                    var sheet = document.styleSheets[i];
                    try {
                        sheet.cssRules;
                    }
                    catch (err) {
                        continue;
                    }
                    editableSheet = sheet;
                    break;
                }
                return editableSheet != null ? editableSheet : createStyleSheet();
            }
            function createStyleSheet() {
                var style = document.createElement("style");
                document.head.appendChild(style);
                return style.sheet;
            }
            function redraw() {
                if (self.config.noCalendar || self.isMobile)
                    return;
                buildMonthSwitch();
                updateNavigationCurrentMonth();
                buildDays();
            }
            function focusAndClose() {
                self._input.focus();
                if (window.navigator.userAgent.indexOf("MSIE") !== -1 ||
                    navigator.msMaxTouchPoints !== undefined) {
                    // hack - bugs in the way IE handles focus keeps the calendar open
                    setTimeout(self.close, 0);
                }
                else {
                    self.close();
                }
            }
            function selectDate(e) {
                e.preventDefault();
                e.stopPropagation();
                var isSelectable = function (day) {
                    return day.classList &&
                        day.classList.contains("flatpickr-day") &&
                        !day.classList.contains("flatpickr-disabled") &&
                        !day.classList.contains("notAllowed");
                };
                var t = findParent(getEventTarget(e), isSelectable);
                if (t === undefined)
                    return;
                var target = t;
                var selectedDate = (self.latestSelectedDateObj = new Date(target.dateObj.getTime()));
                var shouldChangeMonth = (selectedDate.getMonth() < self.currentMonth ||
                    selectedDate.getMonth() >
                        self.currentMonth + self.config.showMonths - 1) &&
                    self.config.mode !== "range";
                self.selectedDateElem = target;
                if (self.config.mode === "single")
                    self.selectedDates = [selectedDate];
                else if (self.config.mode === "multiple") {
                    var selectedIndex = isDateSelected(selectedDate);
                    if (selectedIndex)
                        self.selectedDates.splice(parseInt(selectedIndex), 1);
                    else
                        self.selectedDates.push(selectedDate);
                }
                else if (self.config.mode === "range") {
                    if (self.selectedDates.length === 2) {
                        self.clear(false, false);
                    }
                    self.latestSelectedDateObj = selectedDate;
                    self.selectedDates.push(selectedDate);
                    // unless selecting same date twice, sort ascendingly
                    if (compareDates(selectedDate, self.selectedDates[0], true) !== 0)
                        self.selectedDates.sort(function (a, b) { return a.getTime() - b.getTime(); });
                }
                setHoursFromInputs();
                if (shouldChangeMonth) {
                    var isNewYear = self.currentYear !== selectedDate.getFullYear();
                    self.currentYear = selectedDate.getFullYear();
                    self.currentMonth = selectedDate.getMonth();
                    if (isNewYear) {
                        triggerEvent("onYearChange");
                        buildMonthSwitch();
                    }
                    triggerEvent("onMonthChange");
                }
                updateNavigationCurrentMonth();
                buildDays();
                updateValue();
                // maintain focus
                if (!shouldChangeMonth &&
                    self.config.mode !== "range" &&
                    self.config.showMonths === 1)
                    focusOnDayElem(target);
                else if (self.selectedDateElem !== undefined &&
                    self.hourElement === undefined) {
                    self.selectedDateElem && self.selectedDateElem.focus();
                }
                if (self.hourElement !== undefined)
                    self.hourElement !== undefined && self.hourElement.focus();
                if (self.config.closeOnSelect) {
                    var single = self.config.mode === "single" && !self.config.enableTime;
                    var range = self.config.mode === "range" &&
                        self.selectedDates.length === 2 &&
                        !self.config.enableTime;
                    if (single || range) {
                        focusAndClose();
                    }
                }
                triggerChange();
            }
            var CALLBACKS = {
                locale: [setupLocale, updateWeekdays],
                showMonths: [buildMonths, setCalendarWidth, buildWeekdays],
                minDate: [jumpToDate],
                maxDate: [jumpToDate],
            };
            function set(option, value) {
                if (option !== null && typeof option === "object") {
                    Object.assign(self.config, option);
                    for (var key in option) {
                        if (CALLBACKS[key] !== undefined)
                            CALLBACKS[key].forEach(function (x) { return x(); });
                    }
                }
                else {
                    self.config[option] = value;
                    if (CALLBACKS[option] !== undefined)
                        CALLBACKS[option].forEach(function (x) { return x(); });
                    else if (HOOKS.indexOf(option) > -1)
                        self.config[option] = arrayify(value);
                }
                self.redraw();
                updateValue(true);
            }
            function setSelectedDate(inputDate, format) {
                var dates = [];
                if (inputDate instanceof Array)
                    dates = inputDate.map(function (d) { return self.parseDate(d, format); });
                else if (inputDate instanceof Date || typeof inputDate === "number")
                    dates = [self.parseDate(inputDate, format)];
                else if (typeof inputDate === "string") {
                    switch (self.config.mode) {
                        case "single":
                        case "time":
                            dates = [self.parseDate(inputDate, format)];
                            break;
                        case "multiple":
                            dates = inputDate
                                .split(self.config.conjunction)
                                .map(function (date) { return self.parseDate(date, format); });
                            break;
                        case "range":
                            dates = inputDate
                                .split(self.l10n.rangeSeparator)
                                .map(function (date) { return self.parseDate(date, format); });
                            break;
                    }
                }
                else
                    self.config.errorHandler(new Error("Invalid date supplied: " + JSON.stringify(inputDate)));
                self.selectedDates = (self.config.allowInvalidPreload
                    ? dates
                    : dates.filter(function (d) { return d instanceof Date && isEnabled(d, false); }));
                if (self.config.mode === "range")
                    self.selectedDates.sort(function (a, b) { return a.getTime() - b.getTime(); });
            }
            function setDate(date, triggerChange, format) {
                if (triggerChange === void 0) { triggerChange = false; }
                if (format === void 0) { format = self.config.dateFormat; }
                if ((date !== 0 && !date) || (date instanceof Array && date.length === 0))
                    return self.clear(triggerChange);
                setSelectedDate(date, format);
                self.latestSelectedDateObj =
                    self.selectedDates[self.selectedDates.length - 1];
                self.redraw();
                jumpToDate(undefined, triggerChange);
                setHoursFromDate();
                if (self.selectedDates.length === 0) {
                    self.clear(false);
                }
                updateValue(triggerChange);
                if (triggerChange)
                    triggerEvent("onChange");
            }
            function parseDateRules(arr) {
                return arr
                    .slice()
                    .map(function (rule) {
                    if (typeof rule === "string" ||
                        typeof rule === "number" ||
                        rule instanceof Date) {
                        return self.parseDate(rule, undefined, true);
                    }
                    else if (rule &&
                        typeof rule === "object" &&
                        rule.from &&
                        rule.to)
                        return {
                            from: self.parseDate(rule.from, undefined),
                            to: self.parseDate(rule.to, undefined),
                        };
                    return rule;
                })
                    .filter(function (x) { return x; }); // remove falsy values
            }
            function setupDates() {
                self.selectedDates = [];
                self.now = self.parseDate(self.config.now) || new Date();
                // Workaround IE11 setting placeholder as the input's value
                var preloadedDate = self.config.defaultDate ||
                    ((self.input.nodeName === "INPUT" ||
                        self.input.nodeName === "TEXTAREA") &&
                        self.input.placeholder &&
                        self.input.value === self.input.placeholder
                        ? null
                        : self.input.value);
                if (preloadedDate)
                    setSelectedDate(preloadedDate, self.config.dateFormat);
                self._initialDate =
                    self.selectedDates.length > 0
                        ? self.selectedDates[0]
                        : self.config.minDate &&
                            self.config.minDate.getTime() > self.now.getTime()
                            ? self.config.minDate
                            : self.config.maxDate &&
                                self.config.maxDate.getTime() < self.now.getTime()
                                ? self.config.maxDate
                                : self.now;
                self.currentYear = self._initialDate.getFullYear();
                self.currentMonth = self._initialDate.getMonth();
                if (self.selectedDates.length > 0)
                    self.latestSelectedDateObj = self.selectedDates[0];
                if (self.config.minTime !== undefined)
                    self.config.minTime = self.parseDate(self.config.minTime, "H:i");
                if (self.config.maxTime !== undefined)
                    self.config.maxTime = self.parseDate(self.config.maxTime, "H:i");
                self.minDateHasTime =
                    !!self.config.minDate &&
                        (self.config.minDate.getHours() > 0 ||
                            self.config.minDate.getMinutes() > 0 ||
                            self.config.minDate.getSeconds() > 0);
                self.maxDateHasTime =
                    !!self.config.maxDate &&
                        (self.config.maxDate.getHours() > 0 ||
                            self.config.maxDate.getMinutes() > 0 ||
                            self.config.maxDate.getSeconds() > 0);
            }
            function setupInputs() {
                self.input = getInputElem();
                /* istanbul ignore next */
                if (!self.input) {
                    self.config.errorHandler(new Error("Invalid input element specified"));
                    return;
                }
                // hack: store previous type to restore it after destroy()
                self.input._type = self.input.type;
                self.input.type = "text";
                self.input.classList.add("flatpickr-input");
                self._input = self.input;
                if (self.config.altInput) {
                    // replicate self.element
                    self.altInput = createElement(self.input.nodeName, self.config.altInputClass);
                    self._input = self.altInput;
                    self.altInput.placeholder = self.input.placeholder;
                    self.altInput.disabled = self.input.disabled;
                    self.altInput.required = self.input.required;
                    self.altInput.tabIndex = self.input.tabIndex;
                    self.altInput.type = "text";
                    self.input.setAttribute("type", "hidden");
                    if (!self.config.static && self.input.parentNode)
                        self.input.parentNode.insertBefore(self.altInput, self.input.nextSibling);
                }
                if (!self.config.allowInput)
                    self._input.setAttribute("readonly", "readonly");
                self._positionElement = self.config.positionElement || self._input;
            }
            function setupMobile() {
                var inputType = self.config.enableTime
                    ? self.config.noCalendar
                        ? "time"
                        : "datetime-local"
                    : "date";
                self.mobileInput = createElement("input", self.input.className + " flatpickr-mobile");
                self.mobileInput.tabIndex = 1;
                self.mobileInput.type = inputType;
                self.mobileInput.disabled = self.input.disabled;
                self.mobileInput.required = self.input.required;
                self.mobileInput.placeholder = self.input.placeholder;
                self.mobileFormatStr =
                    inputType === "datetime-local"
                        ? "Y-m-d\\TH:i:S"
                        : inputType === "date"
                            ? "Y-m-d"
                            : "H:i:S";
                if (self.selectedDates.length > 0) {
                    self.mobileInput.defaultValue = self.mobileInput.value = self.formatDate(self.selectedDates[0], self.mobileFormatStr);
                }
                if (self.config.minDate)
                    self.mobileInput.min = self.formatDate(self.config.minDate, "Y-m-d");
                if (self.config.maxDate)
                    self.mobileInput.max = self.formatDate(self.config.maxDate, "Y-m-d");
                if (self.input.getAttribute("step"))
                    self.mobileInput.step = String(self.input.getAttribute("step"));
                self.input.type = "hidden";
                if (self.altInput !== undefined)
                    self.altInput.type = "hidden";
                try {
                    if (self.input.parentNode)
                        self.input.parentNode.insertBefore(self.mobileInput, self.input.nextSibling);
                }
                catch (_a) { }
                bind(self.mobileInput, "change", function (e) {
                    self.setDate(getEventTarget(e).value, false, self.mobileFormatStr);
                    triggerEvent("onChange");
                    triggerEvent("onClose");
                });
            }
            function toggle(e) {
                if (self.isOpen === true)
                    return self.close();
                self.open(e);
            }
            function triggerEvent(event, data) {
                // If the instance has been destroyed already, all hooks have been removed
                if (self.config === undefined)
                    return;
                var hooks = self.config[event];
                if (hooks !== undefined && hooks.length > 0) {
                    for (var i = 0; hooks[i] && i < hooks.length; i++)
                        hooks[i](self.selectedDates, self.input.value, self, data);
                }
                if (event === "onChange") {
                    self.input.dispatchEvent(createEvent("change"));
                    // many front-end frameworks bind to the input event
                    self.input.dispatchEvent(createEvent("input"));
                }
            }
            function createEvent(name) {
                var e = document.createEvent("Event");
                e.initEvent(name, true, true);
                return e;
            }
            function isDateSelected(date) {
                for (var i = 0; i < self.selectedDates.length; i++) {
                    if (compareDates(self.selectedDates[i], date) === 0)
                        return "" + i;
                }
                return false;
            }
            function isDateInRange(date) {
                if (self.config.mode !== "range" || self.selectedDates.length < 2)
                    return false;
                return (compareDates(date, self.selectedDates[0]) >= 0 &&
                    compareDates(date, self.selectedDates[1]) <= 0);
            }
            function updateNavigationCurrentMonth() {
                if (self.config.noCalendar || self.isMobile || !self.monthNav)
                    return;
                self.yearElements.forEach(function (yearElement, i) {
                    var d = new Date(self.currentYear, self.currentMonth, 1);
                    d.setMonth(self.currentMonth + i);
                    if (self.config.showMonths > 1 ||
                        self.config.monthSelectorType === "static") {
                        self.monthElements[i].textContent =
                            monthToStr(d.getMonth(), self.config.shorthandCurrentMonth, self.l10n) + " ";
                    }
                    else {
                        self.monthsDropdownContainer.value = d.getMonth().toString();
                    }
                    yearElement.value = d.getFullYear().toString();
                });
                self._hidePrevMonthArrow =
                    self.config.minDate !== undefined &&
                        (self.currentYear === self.config.minDate.getFullYear()
                            ? self.currentMonth <= self.config.minDate.getMonth()
                            : self.currentYear < self.config.minDate.getFullYear());
                self._hideNextMonthArrow =
                    self.config.maxDate !== undefined &&
                        (self.currentYear === self.config.maxDate.getFullYear()
                            ? self.currentMonth + 1 > self.config.maxDate.getMonth()
                            : self.currentYear > self.config.maxDate.getFullYear());
            }
            function getDateStr(format) {
                return self.selectedDates
                    .map(function (dObj) { return self.formatDate(dObj, format); })
                    .filter(function (d, i, arr) {
                    return self.config.mode !== "range" ||
                        self.config.enableTime ||
                        arr.indexOf(d) === i;
                })
                    .join(self.config.mode !== "range"
                    ? self.config.conjunction
                    : self.l10n.rangeSeparator);
            }
            /**
             * Updates the values of inputs associated with the calendar
             */
            function updateValue(triggerChange) {
                if (triggerChange === void 0) { triggerChange = true; }
                if (self.mobileInput !== undefined && self.mobileFormatStr) {
                    self.mobileInput.value =
                        self.latestSelectedDateObj !== undefined
                            ? self.formatDate(self.latestSelectedDateObj, self.mobileFormatStr)
                            : "";
                }
                self.input.value = getDateStr(self.config.dateFormat);
                if (self.altInput !== undefined) {
                    self.altInput.value = getDateStr(self.config.altFormat);
                }
                if (triggerChange !== false)
                    triggerEvent("onValueUpdate");
            }
            function onMonthNavClick(e) {
                var eventTarget = getEventTarget(e);
                var isPrevMonth = self.prevMonthNav.contains(eventTarget);
                var isNextMonth = self.nextMonthNav.contains(eventTarget);
                if (isPrevMonth || isNextMonth) {
                    changeMonth(isPrevMonth ? -1 : 1);
                }
                else if (self.yearElements.indexOf(eventTarget) >= 0) {
                    eventTarget.select();
                }
                else if (eventTarget.classList.contains("arrowUp")) {
                    self.changeYear(self.currentYear + 1);
                }
                else if (eventTarget.classList.contains("arrowDown")) {
                    self.changeYear(self.currentYear - 1);
                }
            }
            function timeWrapper(e) {
                e.preventDefault();
                var isKeyDown = e.type === "keydown", eventTarget = getEventTarget(e), input = eventTarget;
                if (self.amPM !== undefined && eventTarget === self.amPM) {
                    self.amPM.textContent =
                        self.l10n.amPM[int(self.amPM.textContent === self.l10n.amPM[0])];
                }
                var min = parseFloat(input.getAttribute("min")), max = parseFloat(input.getAttribute("max")), step = parseFloat(input.getAttribute("step")), curValue = parseInt(input.value, 10), delta = e.delta ||
                    (isKeyDown ? (e.which === 38 ? 1 : -1) : 0);
                var newValue = curValue + step * delta;
                if (typeof input.value !== "undefined" && input.value.length === 2) {
                    var isHourElem = input === self.hourElement, isMinuteElem = input === self.minuteElement;
                    if (newValue < min) {
                        newValue =
                            max +
                                newValue +
                                int(!isHourElem) +
                                (int(isHourElem) && int(!self.amPM));
                        if (isMinuteElem)
                            incrementNumInput(undefined, -1, self.hourElement);
                    }
                    else if (newValue > max) {
                        newValue =
                            input === self.hourElement ? newValue - max - int(!self.amPM) : min;
                        if (isMinuteElem)
                            incrementNumInput(undefined, 1, self.hourElement);
                    }
                    if (self.amPM &&
                        isHourElem &&
                        (step === 1
                            ? newValue + curValue === 23
                            : Math.abs(newValue - curValue) > step)) {
                        self.amPM.textContent =
                            self.l10n.amPM[int(self.amPM.textContent === self.l10n.amPM[0])];
                    }
                    input.value = pad(newValue);
                }
            }
            init();
            return self;
        }
        /* istanbul ignore next */
        function _flatpickr(nodeList, config) {
            // static list
            var nodes = Array.prototype.slice
                .call(nodeList)
                .filter(function (x) { return x instanceof HTMLElement; });
            var instances = [];
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                try {
                    if (node.getAttribute("data-fp-omit") !== null)
                        continue;
                    if (node._flatpickr !== undefined) {
                        node._flatpickr.destroy();
                        node._flatpickr = undefined;
                    }
                    node._flatpickr = FlatpickrInstance(node, config || {});
                    instances.push(node._flatpickr);
                }
                catch (e) {
                    console.error(e);
                }
            }
            return instances.length === 1 ? instances[0] : instances;
        }
        /* istanbul ignore next */
        if (typeof HTMLElement !== "undefined" &&
            typeof HTMLCollection !== "undefined" &&
            typeof NodeList !== "undefined") {
            // browser env
            HTMLCollection.prototype.flatpickr = NodeList.prototype.flatpickr = function (config) {
                return _flatpickr(this, config);
            };
            HTMLElement.prototype.flatpickr = function (config) {
                return _flatpickr([this], config);
            };
        }
        /* istanbul ignore next */
        var flatpickr = function (selector, config) {
            if (typeof selector === "string") {
                return _flatpickr(window.document.querySelectorAll(selector), config);
            }
            else if (selector instanceof Node) {
                return _flatpickr([selector], config);
            }
            else {
                return _flatpickr(selector, config);
            }
        };
        /* istanbul ignore next */
        flatpickr.defaultConfig = {};
        flatpickr.l10ns = {
            en: __assign({}, english),
            default: __assign({}, english),
        };
        flatpickr.localize = function (l10n) {
            flatpickr.l10ns.default = __assign(__assign({}, flatpickr.l10ns.default), l10n);
        };
        flatpickr.setDefaults = function (config) {
            flatpickr.defaultConfig = __assign(__assign({}, flatpickr.defaultConfig), config);
        };
        flatpickr.parseDate = createDateParser({});
        flatpickr.formatDate = createDateFormatter({});
        flatpickr.compareDates = compareDates;
        /* istanbul ignore next */
        if (typeof jQuery !== "undefined" && typeof jQuery.fn !== "undefined") {
            jQuery.fn.flatpickr = function (config) {
                return _flatpickr(this, config);
            };
        }
        // eslint-disable-next-line @typescript-eslint/camelcase
        Date.prototype.fp_incr = function (days) {
            return new Date(this.getFullYear(), this.getMonth(), this.getDate() + (typeof days === "string" ? parseInt(days, 10) : days));
        };
        if (typeof window !== "undefined") {
            window.flatpickr = flatpickr;
        }

        return flatpickr;

    })));
    });

    /* node_modules\svelte-flatpickr\src\Flatpickr.svelte generated by Svelte v3.31.0 */
    const file$8 = "node_modules\\svelte-flatpickr\\src\\Flatpickr.svelte";

    // (1:6)   
    function fallback_block(ctx) {
    	let input_1;
    	let input_1_levels = [/*$$restProps*/ ctx[1]];
    	let input_1_data = {};

    	for (let i = 0; i < input_1_levels.length; i += 1) {
    		input_1_data = assign(input_1_data, input_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input_1 = element("input");
    			set_attributes(input_1, input_1_data);
    			add_location(input_1, file$8, 1, 1, 8);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input_1, anchor);
    			/*input_1_binding*/ ctx[10](input_1);
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1]]));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input_1);
    			/*input_1_binding*/ ctx[10](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(1:6)   ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*$$restProps, input*/ 3) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
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

    function stripOn(hook) {
    	return hook.charAt(2).toLowerCase() + hook.substring(3);
    }

    function instance$8($$self, $$props, $$invalidate) {
    	const omit_props_names = ["value","formattedValue","element","dateFormat","options","input","flatpickr"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Flatpickr", slots, ['default']);

    	const hooks = new Set([
    			"onChange",
    			"onOpen",
    			"onClose",
    			"onMonthChange",
    			"onYearChange",
    			"onReady",
    			"onValueUpdate",
    			"onDayCreate"
    		]);

    	let { value = "" } = $$props,
    		{ formattedValue = "" } = $$props,
    		{ element = null } = $$props,
    		{ dateFormat = null } = $$props;

    	let { options = {} } = $$props;
    	let { input = undefined } = $$props, { flatpickr: fp = undefined } = $$props;

    	onMount(() => {
    		const elem = element || input;
    		$$invalidate(3, fp = flatpickr(elem, Object.assign(addHooks(options), element ? { wrap: true } : {})));

    		return () => {
    			fp.destroy();
    		};
    	});

    	const dispatch = createEventDispatcher();

    	function addHooks(opts = {}) {
    		opts = Object.assign({}, opts);

    		for (const hook of hooks) {
    			const firer = (selectedDates, dateStr, instance) => {
    				dispatch(stripOn(hook), [selectedDates, dateStr, instance]);
    			};

    			if (hook in opts) {
    				// Hooks must be arrays
    				if (!Array.isArray(opts[hook])) opts[hook] = [opts[hook]];

    				opts[hook].push(firer);
    			} else {
    				opts[hook] = [firer];
    			}
    		}

    		if (opts.onChange && !opts.onChange.includes(updateValue)) opts.onChange.push(updateValue);
    		return opts;
    	}

    	function updateValue(newValue, dateStr) {
    		$$invalidate(2, value = Array.isArray(newValue) && newValue.length === 1
    		? newValue[0]
    		: newValue);

    		$$invalidate(4, formattedValue = dateStr);
    	}

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(0, input);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("value" in $$new_props) $$invalidate(2, value = $$new_props.value);
    		if ("formattedValue" in $$new_props) $$invalidate(4, formattedValue = $$new_props.formattedValue);
    		if ("element" in $$new_props) $$invalidate(5, element = $$new_props.element);
    		if ("dateFormat" in $$new_props) $$invalidate(6, dateFormat = $$new_props.dateFormat);
    		if ("options" in $$new_props) $$invalidate(7, options = $$new_props.options);
    		if ("input" in $$new_props) $$invalidate(0, input = $$new_props.input);
    		if ("flatpickr" in $$new_props) $$invalidate(3, fp = $$new_props.flatpickr);
    		if ("$$scope" in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		flatpickr,
    		hooks,
    		value,
    		formattedValue,
    		element,
    		dateFormat,
    		options,
    		input,
    		fp,
    		dispatch,
    		addHooks,
    		updateValue,
    		stripOn
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("value" in $$props) $$invalidate(2, value = $$new_props.value);
    		if ("formattedValue" in $$props) $$invalidate(4, formattedValue = $$new_props.formattedValue);
    		if ("element" in $$props) $$invalidate(5, element = $$new_props.element);
    		if ("dateFormat" in $$props) $$invalidate(6, dateFormat = $$new_props.dateFormat);
    		if ("options" in $$props) $$invalidate(7, options = $$new_props.options);
    		if ("input" in $$props) $$invalidate(0, input = $$new_props.input);
    		if ("fp" in $$props) $$invalidate(3, fp = $$new_props.fp);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*fp, value, dateFormat*/ 76) {
    			 if (fp) {
    				fp.setDate(value, false, dateFormat);
    			}
    		}

    		if ($$self.$$.dirty & /*fp, options*/ 136) {
    			 if (fp) {
    				for (const [key, val] of Object.entries(addHooks(options))) {
    					fp.set(key, val);
    				}
    			}
    		}
    	};

    	return [
    		input,
    		$$restProps,
    		value,
    		fp,
    		formattedValue,
    		element,
    		dateFormat,
    		options,
    		$$scope,
    		slots,
    		input_1_binding
    	];
    }

    class Flatpickr extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			value: 2,
    			formattedValue: 4,
    			element: 5,
    			dateFormat: 6,
    			options: 7,
    			input: 0,
    			flatpickr: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Flatpickr",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get value() {
    		throw new Error("<Flatpickr>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Flatpickr>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get formattedValue() {
    		throw new Error("<Flatpickr>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set formattedValue(value) {
    		throw new Error("<Flatpickr>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get element() {
    		throw new Error("<Flatpickr>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error("<Flatpickr>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dateFormat() {
    		throw new Error("<Flatpickr>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dateFormat(value) {
    		throw new Error("<Flatpickr>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Flatpickr>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Flatpickr>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get input() {
    		throw new Error("<Flatpickr>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set input(value) {
    		throw new Error("<Flatpickr>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flatpickr() {
    		throw new Error("<Flatpickr>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flatpickr(value) {
    		throw new Error("<Flatpickr>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-tags-input\src\Tags.svelte generated by Svelte v3.31.0 */
    const file$9 = "node_modules\\svelte-tags-input\\src\\Tags.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[35] = list[i];
    	child_ctx[37] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[39] = i;
    	return child_ctx;
    }

    // (263:4) {#if tags.length > 0}
    function create_if_block_1$1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*tags*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*removeTag, disable, tags*/ 1057) {
    				each_value_1 = /*tags*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(263:4) {#if tags.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (266:16) {#if !disable}
    function create_if_block_2$1(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[25](/*i*/ ctx[39]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "×";
    			attr_dev(span, "class", "svelte-tags-input-tag-remove svelte-1s4blrc");
    			add_location(span, file$9, 266, 16, 7256);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(266:16) {#if !disable}",
    		ctx
    	});

    	return block;
    }

    // (264:8) {#each tags as tag, i}
    function create_each_block_1(ctx) {
    	let span;
    	let t0_value = /*tag*/ ctx[7] + "";
    	let t0;
    	let t1;
    	let t2;
    	let if_block = !/*disable*/ ctx[5] && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(span, "class", "svelte-tags-input-tag svelte-1s4blrc");
    			add_location(span, file$9, 264, 12, 7165);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			if (if_block) if_block.m(span, null);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*tags*/ 1 && t0_value !== (t0_value = /*tag*/ ctx[7] + "")) set_data_dev(t0, t0_value);

    			if (!/*disable*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					if_block.m(span, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(264:8) {#each tags as tag, i}",
    		ctx
    	});

    	return block;
    }

    // (275:0) {#if autoComplete && arrelementsmatch.length > 0}
    function create_if_block$2(ctx) {
    	let div;
    	let ul;
    	let ul_id_value;
    	let each_value = /*arrelementsmatch*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "id", ul_id_value = "" + (/*id*/ ctx[4] + "_matchs"));
    			attr_dev(ul, "class", "svelte-tags-input-matchs svelte-1s4blrc");
    			add_location(ul, file$9, 276, 8, 7783);
    			attr_dev(div, "class", "svelte-tags-input-matchs-parent svelte-1s4blrc");
    			add_location(div, file$9, 275, 4, 7728);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*navigateAutoComplete, arrelementsmatch, addTag*/ 33344) {
    				each_value = /*arrelementsmatch*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*id*/ 16 && ul_id_value !== (ul_id_value = "" + (/*id*/ ctx[4] + "_matchs"))) {
    				attr_dev(ul, "id", ul_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(275:0) {#if autoComplete && arrelementsmatch.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (278:12) {#each arrelementsmatch as element, index}
    function create_each_block$1(ctx) {
    	let li;
    	let raw_value = /*element*/ ctx[35].search + "";
    	let mounted;
    	let dispose;

    	function keydown_handler() {
    		return /*keydown_handler*/ ctx[28](/*index*/ ctx[37], /*element*/ ctx[35]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[29](/*element*/ ctx[35]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			attr_dev(li, "tabindex", "-1");
    			attr_dev(li, "class", "svelte-1s4blrc");
    			add_location(li, file$9, 278, 16, 7911);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			li.innerHTML = raw_value;

    			if (!mounted) {
    				dispose = [
    					listen_dev(li, "keydown", keydown_handler, false, false, false),
    					listen_dev(li, "click", click_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*arrelementsmatch*/ 64 && raw_value !== (raw_value = /*element*/ ctx[35].search + "")) li.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(278:12) {#each arrelementsmatch as element, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let t0;
    	let input;
    	let t1;
    	let if_block1_anchor;
    	let mounted;
    	let dispose;
    	let if_block0 = /*tags*/ ctx[0].length > 0 && create_if_block_1$1(ctx);
    	let if_block1 = /*autoComplete*/ ctx[2] && /*arrelementsmatch*/ ctx[6].length > 0 && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			input = element("input");
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", /*id*/ ctx[4]);
    			attr_dev(input, "name", /*name*/ ctx[3]);
    			attr_dev(input, "class", "svelte-tags-input svelte-1s4blrc");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			input.disabled = /*disable*/ ctx[5];
    			add_location(input, file$9, 271, 4, 7421);
    			attr_dev(div, "class", "svelte-tags-input-layout svelte-1s4blrc");
    			toggle_class(div, "sti-layout-disable", /*disable*/ ctx[5]);
    			add_location(div, file$9, 261, 0, 7019);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, input);
    			set_input_value(input, /*tag*/ ctx[7]);
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[26]),
    					listen_dev(input, "keydown", /*setTag*/ ctx[8], false, false, false),
    					listen_dev(input, "keyup", /*getMatchElements*/ ctx[14], false, false, false),
    					listen_dev(input, "paste", /*onPaste*/ ctx[11], false, false, false),
    					listen_dev(input, "drop", /*onDrop*/ ctx[12], false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[27], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*tags*/ ctx[0].length > 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty[0] & /*id*/ 16) {
    				attr_dev(input, "id", /*id*/ ctx[4]);
    			}

    			if (dirty[0] & /*name*/ 8) {
    				attr_dev(input, "name", /*name*/ ctx[3]);
    			}

    			if (dirty[0] & /*placeholder*/ 2) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			}

    			if (dirty[0] & /*disable*/ 32) {
    				prop_dev(input, "disabled", /*disable*/ ctx[5]);
    			}

    			if (dirty[0] & /*tag*/ 128 && input.value !== /*tag*/ ctx[7]) {
    				set_input_value(input, /*tag*/ ctx[7]);
    			}

    			if (dirty[0] & /*disable*/ 32) {
    				toggle_class(div, "sti-layout-disable", /*disable*/ ctx[5]);
    			}

    			if (/*autoComplete*/ ctx[2] && /*arrelementsmatch*/ ctx[6].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			run_all(dispose);
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

    function getClipboardData(e) {
    	if (window.clipboardData) {
    		return window.clipboardData.getData("Text");
    	}

    	if (e.clipboardData) {
    		return e.clipboardData.getData("text/plain");
    	}

    	return "";
    }

    function uniqueID() {
    	return "sti_" + Math.random().toString(36).substr(2, 9);
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tags", slots, []);
    	const dispatch = createEventDispatcher();
    	let tag = "";
    	let arrelementsmatch = [];

    	let regExpEscape = s => {
    		return s.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
    	};

    	let { tags } = $$props;
    	let { addKeys } = $$props;
    	let { maxTags } = $$props;
    	let { onlyUnique } = $$props;
    	let { removeKeys } = $$props;
    	let { placeholder } = $$props;
    	let { allowPaste } = $$props;
    	let { allowDrop } = $$props;
    	let { splitWith } = $$props;
    	let { autoComplete } = $$props;
    	let { name } = $$props;
    	let { id } = $$props;
    	let { allowBlur } = $$props;
    	let { disable } = $$props;
    	let { minChars } = $$props;
    	let storePlaceholder = placeholder;

    	function setTag(input) {
    		const currentTag = input.target.value;

    		if (addKeys) {
    			addKeys.forEach(function (key) {
    				if (key === input.keyCode) {
    					if (currentTag) input.preventDefault();

    					switch (input.keyCode) {
    						case 9:
    							// TAB add first element on the autoComplete list
    							if (autoComplete && document.getElementById(matchsID)) {
    								addTag(document.getElementById(matchsID).querySelectorAll("li")[0].textContent);
    							} else {
    								addTag(currentTag);
    							}
    							break;
    						default:
    							addTag(currentTag);
    							break;
    					}
    				}
    			});
    		}

    		if (removeKeys) {
    			removeKeys.forEach(function (key) {
    				if (key === input.keyCode && tag === "") {
    					tags.pop();
    					$$invalidate(0, tags);
    					dispatch("tags", { tags });
    					$$invalidate(6, arrelementsmatch = []);
    					document.getElementById(id).readOnly = false;
    					$$invalidate(1, placeholder = storePlaceholder);
    					document.getElementById(id).focus();
    				}
    			});
    		}

    		// ArrowDown : focus on first element of the autocomplete
    		if (input.keyCode === 40 && autoComplete && document.getElementById(matchsID)) {
    			event.preventDefault();
    			document.getElementById(matchsID).querySelector("li:first-child").focus();
    		} else if (input.keyCode === 38 && autoComplete && document.getElementById(matchsID)) {
    			event.preventDefault(); // ArrowUp : focus on last element of the autocomplete
    			document.getElementById(matchsID).querySelector("li:last-child").focus();
    		}
    	}

    	function addTag(currentTag) {
    		currentTag = currentTag.trim();
    		if (currentTag == "") return;
    		if (maxTags && tags.length == maxTags) return;
    		if (onlyUnique && tags.includes(currentTag)) return;
    		tags.push(currentTag);
    		$$invalidate(0, tags);
    		$$invalidate(7, tag = "");
    		dispatch("tags", { tags });

    		// Hide autocomplete list
    		// Focus on svelte tags input
    		$$invalidate(6, arrelementsmatch = []);

    		document.getElementById(id).focus();

    		if (maxTags && tags.length == maxTags) {
    			document.getElementById(id).readOnly = true;
    			$$invalidate(1, placeholder = "");
    		}

    		
    	}

    	function removeTag(i) {
    		tags.splice(i, 1);
    		$$invalidate(0, tags);
    		dispatch("tags", { tags });

    		// Hide autocomplete list
    		// Focus on svelte tags input
    		$$invalidate(6, arrelementsmatch = []);

    		document.getElementById(id).readOnly = false;
    		$$invalidate(1, placeholder = storePlaceholder);
    		document.getElementById(id).focus();
    	}

    	function onPaste(e) {
    		if (!allowPaste) return;
    		e.preventDefault();
    		const data = getClipboardData(e);
    		const tags = splitTags(data).map(tag => addTag(tag));
    	}

    	function onDrop(e) {
    		if (!allowDrop) return;
    		e.preventDefault();
    		const data = e.dataTransfer.getData("Text");
    		const tags = splitTags(data).map(tag => addTag(tag));
    	}

    	function onBlur(tag) {
    		if (!document.getElementById(matchsID) && allowBlur) {
    			event.preventDefault();
    			addTag(tag);
    		}
    	}

    	function splitTags(data) {
    		return data.split(splitWith).map(tag => tag.trim());
    	}

    	function getMatchElements(input) {
    		if (!autoComplete) return;
    		var value = input.target.value;

    		// Escape
    		if (value == "" || input.keyCode === 27 || value.length < minChars) {
    			$$invalidate(6, arrelementsmatch = []);
    			return;
    		}

    		var matchs = autoComplete.filter(e => e.toLowerCase().includes(value.toLowerCase())).map(matchTag => {
    			return {
    				label: matchTag,
    				search: matchTag.replace(RegExp(regExpEscape(value.toLowerCase()), "i"), "<strong>$&</strong>")
    			};
    		});

    		

    		if (onlyUnique === true) {
    			matchs = matchs.filter(tag => !tags.includes(tag.label));
    		}

    		$$invalidate(6, arrelementsmatch = matchs);
    	}

    	function navigateAutoComplete(autoCompleteIndex, autoCompleteLength, autoCompleteElement) {
    		if (!autoComplete) return;
    		event.preventDefault();

    		// ArrowDown
    		if (event.keyCode === 40) {
    			// Last element on the list ? Go to the first
    			if (autoCompleteIndex + 1 === autoCompleteLength) {
    				document.getElementById(matchsID).querySelector("li:first-child").focus();
    				return;
    			}

    			document.getElementById(matchsID).querySelectorAll("li")[autoCompleteIndex + 1].focus();
    		} else if (event.keyCode === 38) {
    			// ArrowUp
    			// First element on the list ? Go to the last
    			if (autoCompleteIndex === 0) {
    				document.getElementById(matchsID).querySelector("li:last-child").focus();
    				return;
    			}

    			document.getElementById(matchsID).querySelectorAll("li")[autoCompleteIndex - 1].focus();
    		} else if (event.keyCode === 13) {
    			// Enter
    			addTag(autoCompleteElement);
    		} else if (event.keyCode === 27) {
    			// Escape
    			$$invalidate(6, arrelementsmatch = []);

    			document.getElementById(id).focus();
    		}
    	}

    	

    	const writable_props = [
    		"tags",
    		"addKeys",
    		"maxTags",
    		"onlyUnique",
    		"removeKeys",
    		"placeholder",
    		"allowPaste",
    		"allowDrop",
    		"splitWith",
    		"autoComplete",
    		"name",
    		"id",
    		"allowBlur",
    		"disable",
    		"minChars"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tags> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => removeTag(i);

    	function input_input_handler() {
    		tag = this.value;
    		$$invalidate(7, tag);
    	}

    	const blur_handler = () => onBlur(tag);
    	const keydown_handler = (index, element) => navigateAutoComplete(index, arrelementsmatch.length, element.label);
    	const click_handler_1 = element => addTag(element.label);

    	$$self.$$set = $$props => {
    		if ("tags" in $$props) $$invalidate(0, tags = $$props.tags);
    		if ("addKeys" in $$props) $$invalidate(16, addKeys = $$props.addKeys);
    		if ("maxTags" in $$props) $$invalidate(17, maxTags = $$props.maxTags);
    		if ("onlyUnique" in $$props) $$invalidate(18, onlyUnique = $$props.onlyUnique);
    		if ("removeKeys" in $$props) $$invalidate(19, removeKeys = $$props.removeKeys);
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ("allowPaste" in $$props) $$invalidate(20, allowPaste = $$props.allowPaste);
    		if ("allowDrop" in $$props) $$invalidate(21, allowDrop = $$props.allowDrop);
    		if ("splitWith" in $$props) $$invalidate(22, splitWith = $$props.splitWith);
    		if ("autoComplete" in $$props) $$invalidate(2, autoComplete = $$props.autoComplete);
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    		if ("id" in $$props) $$invalidate(4, id = $$props.id);
    		if ("allowBlur" in $$props) $$invalidate(23, allowBlur = $$props.allowBlur);
    		if ("disable" in $$props) $$invalidate(5, disable = $$props.disable);
    		if ("minChars" in $$props) $$invalidate(24, minChars = $$props.minChars);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		tag,
    		arrelementsmatch,
    		regExpEscape,
    		tags,
    		addKeys,
    		maxTags,
    		onlyUnique,
    		removeKeys,
    		placeholder,
    		allowPaste,
    		allowDrop,
    		splitWith,
    		autoComplete,
    		name,
    		id,
    		allowBlur,
    		disable,
    		minChars,
    		storePlaceholder,
    		setTag,
    		addTag,
    		removeTag,
    		onPaste,
    		onDrop,
    		onBlur,
    		getClipboardData,
    		splitTags,
    		getMatchElements,
    		navigateAutoComplete,
    		uniqueID,
    		matchsID
    	});

    	$$self.$inject_state = $$props => {
    		if ("tag" in $$props) $$invalidate(7, tag = $$props.tag);
    		if ("arrelementsmatch" in $$props) $$invalidate(6, arrelementsmatch = $$props.arrelementsmatch);
    		if ("regExpEscape" in $$props) regExpEscape = $$props.regExpEscape;
    		if ("tags" in $$props) $$invalidate(0, tags = $$props.tags);
    		if ("addKeys" in $$props) $$invalidate(16, addKeys = $$props.addKeys);
    		if ("maxTags" in $$props) $$invalidate(17, maxTags = $$props.maxTags);
    		if ("onlyUnique" in $$props) $$invalidate(18, onlyUnique = $$props.onlyUnique);
    		if ("removeKeys" in $$props) $$invalidate(19, removeKeys = $$props.removeKeys);
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ("allowPaste" in $$props) $$invalidate(20, allowPaste = $$props.allowPaste);
    		if ("allowDrop" in $$props) $$invalidate(21, allowDrop = $$props.allowDrop);
    		if ("splitWith" in $$props) $$invalidate(22, splitWith = $$props.splitWith);
    		if ("autoComplete" in $$props) $$invalidate(2, autoComplete = $$props.autoComplete);
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    		if ("id" in $$props) $$invalidate(4, id = $$props.id);
    		if ("allowBlur" in $$props) $$invalidate(23, allowBlur = $$props.allowBlur);
    		if ("disable" in $$props) $$invalidate(5, disable = $$props.disable);
    		if ("minChars" in $$props) $$invalidate(24, minChars = $$props.minChars);
    		if ("storePlaceholder" in $$props) storePlaceholder = $$props.storePlaceholder;
    		if ("matchsID" in $$props) matchsID = $$props.matchsID;
    	};

    	let matchsID;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*tags*/ 1) {
    			 $$invalidate(0, tags = tags || []);
    		}

    		if ($$self.$$.dirty[0] & /*addKeys*/ 65536) {
    			 $$invalidate(16, addKeys = addKeys || [13]);
    		}

    		if ($$self.$$.dirty[0] & /*maxTags*/ 131072) {
    			 $$invalidate(17, maxTags = maxTags || false);
    		}

    		if ($$self.$$.dirty[0] & /*onlyUnique*/ 262144) {
    			 $$invalidate(18, onlyUnique = onlyUnique || false);
    		}

    		if ($$self.$$.dirty[0] & /*removeKeys*/ 524288) {
    			 $$invalidate(19, removeKeys = removeKeys || [8]);
    		}

    		if ($$self.$$.dirty[0] & /*placeholder*/ 2) {
    			 $$invalidate(1, placeholder = placeholder || "");
    		}

    		if ($$self.$$.dirty[0] & /*allowPaste*/ 1048576) {
    			 $$invalidate(20, allowPaste = allowPaste || false);
    		}

    		if ($$self.$$.dirty[0] & /*allowDrop*/ 2097152) {
    			 $$invalidate(21, allowDrop = allowDrop || false);
    		}

    		if ($$self.$$.dirty[0] & /*splitWith*/ 4194304) {
    			 $$invalidate(22, splitWith = splitWith || ",");
    		}

    		if ($$self.$$.dirty[0] & /*autoComplete*/ 4) {
    			 $$invalidate(2, autoComplete = autoComplete || false);
    		}

    		if ($$self.$$.dirty[0] & /*name*/ 8) {
    			 $$invalidate(3, name = name || "svelte-tags-input");
    		}

    		if ($$self.$$.dirty[0] & /*id*/ 16) {
    			 $$invalidate(4, id = id || uniqueID());
    		}

    		if ($$self.$$.dirty[0] & /*allowBlur*/ 8388608) {
    			 $$invalidate(23, allowBlur = allowBlur || false);
    		}

    		if ($$self.$$.dirty[0] & /*disable*/ 32) {
    			 $$invalidate(5, disable = disable || false);
    		}

    		if ($$self.$$.dirty[0] & /*minChars*/ 16777216) {
    			 $$invalidate(24, minChars = minChars || 1);
    		}

    		if ($$self.$$.dirty[0] & /*id*/ 16) {
    			 matchsID = id + "_matchs";
    		}
    	};

    	return [
    		tags,
    		placeholder,
    		autoComplete,
    		name,
    		id,
    		disable,
    		arrelementsmatch,
    		tag,
    		setTag,
    		addTag,
    		removeTag,
    		onPaste,
    		onDrop,
    		onBlur,
    		getMatchElements,
    		navigateAutoComplete,
    		addKeys,
    		maxTags,
    		onlyUnique,
    		removeKeys,
    		allowPaste,
    		allowDrop,
    		splitWith,
    		allowBlur,
    		minChars,
    		click_handler,
    		input_input_handler,
    		blur_handler,
    		keydown_handler,
    		click_handler_1
    	];
    }

    class Tags extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$9,
    			create_fragment$9,
    			safe_not_equal,
    			{
    				tags: 0,
    				addKeys: 16,
    				maxTags: 17,
    				onlyUnique: 18,
    				removeKeys: 19,
    				placeholder: 1,
    				allowPaste: 20,
    				allowDrop: 21,
    				splitWith: 22,
    				autoComplete: 2,
    				name: 3,
    				id: 4,
    				allowBlur: 23,
    				disable: 5,
    				minChars: 24
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tags",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tags*/ ctx[0] === undefined && !("tags" in props)) {
    			console.warn("<Tags> was created without expected prop 'tags'");
    		}

    		if (/*addKeys*/ ctx[16] === undefined && !("addKeys" in props)) {
    			console.warn("<Tags> was created without expected prop 'addKeys'");
    		}

    		if (/*maxTags*/ ctx[17] === undefined && !("maxTags" in props)) {
    			console.warn("<Tags> was created without expected prop 'maxTags'");
    		}

    		if (/*onlyUnique*/ ctx[18] === undefined && !("onlyUnique" in props)) {
    			console.warn("<Tags> was created without expected prop 'onlyUnique'");
    		}

    		if (/*removeKeys*/ ctx[19] === undefined && !("removeKeys" in props)) {
    			console.warn("<Tags> was created without expected prop 'removeKeys'");
    		}

    		if (/*placeholder*/ ctx[1] === undefined && !("placeholder" in props)) {
    			console.warn("<Tags> was created without expected prop 'placeholder'");
    		}

    		if (/*allowPaste*/ ctx[20] === undefined && !("allowPaste" in props)) {
    			console.warn("<Tags> was created without expected prop 'allowPaste'");
    		}

    		if (/*allowDrop*/ ctx[21] === undefined && !("allowDrop" in props)) {
    			console.warn("<Tags> was created without expected prop 'allowDrop'");
    		}

    		if (/*splitWith*/ ctx[22] === undefined && !("splitWith" in props)) {
    			console.warn("<Tags> was created without expected prop 'splitWith'");
    		}

    		if (/*autoComplete*/ ctx[2] === undefined && !("autoComplete" in props)) {
    			console.warn("<Tags> was created without expected prop 'autoComplete'");
    		}

    		if (/*name*/ ctx[3] === undefined && !("name" in props)) {
    			console.warn("<Tags> was created without expected prop 'name'");
    		}

    		if (/*id*/ ctx[4] === undefined && !("id" in props)) {
    			console.warn("<Tags> was created without expected prop 'id'");
    		}

    		if (/*allowBlur*/ ctx[23] === undefined && !("allowBlur" in props)) {
    			console.warn("<Tags> was created without expected prop 'allowBlur'");
    		}

    		if (/*disable*/ ctx[5] === undefined && !("disable" in props)) {
    			console.warn("<Tags> was created without expected prop 'disable'");
    		}

    		if (/*minChars*/ ctx[24] === undefined && !("minChars" in props)) {
    			console.warn("<Tags> was created without expected prop 'minChars'");
    		}
    	}

    	get tags() {
    		throw new Error("<Tags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tags(value) {
    		throw new Error("<Tags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addKeys() {
    		throw new Error("<Tags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addKeys(value) {
    		throw new Error("<Tags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxTags() {
    		throw new Error("<Tags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxTags(value) {
    		throw new Error("<Tags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onlyUnique() {
    		throw new Error("<Tags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onlyUnique(value) {
    		throw new Error("<Tags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get removeKeys() {
    		throw new Error("<Tags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set removeKeys(value) {
    		throw new Error("<Tags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Tags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Tags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get allowPaste() {
    		throw new Error("<Tags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set allowPaste(value) {
    		throw new Error("<Tags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get allowDrop() {
    		throw new Error("<Tags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set allowDrop(value) {
    		throw new Error("<Tags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get splitWith() {
    		throw new Error("<Tags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set splitWith(value) {
    		throw new Error("<Tags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoComplete() {
    		throw new Error("<Tags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoComplete(value) {
    		throw new Error("<Tags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Tags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Tags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Tags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Tags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get allowBlur() {
    		throw new Error("<Tags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set allowBlur(value) {
    		throw new Error("<Tags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disable() {
    		throw new Error("<Tags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disable(value) {
    		throw new Error("<Tags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minChars() {
    		throw new Error("<Tags>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minChars(value) {
    		throw new Error("<Tags>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* templates\components\control-panel\ControlPanel.svelte generated by Svelte v3.31.0 */

    const { console: console_1$1 } = globals;
    const file$a = "templates\\components\\control-panel\\ControlPanel.svelte";

    // (90:4) {#if open}
    function create_if_block$3(ctx) {
    	let div5;
    	let div0;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let div1;
    	let label1;
    	let t4;
    	let input1;
    	let t5;
    	let div2;
    	let label2;
    	let t7;
    	let flatpickr_1;
    	let updating_value;
    	let updating_formattedValue;
    	let updating_flatpickr;
    	let t8;
    	let div3;
    	let label3;
    	let t10;
    	let input2;
    	let t11;
    	let div4;
    	let label4;
    	let t13;
    	let tags;
    	let div5_intro;
    	let div5_outro;
    	let current;
    	let mounted;
    	let dispose;

    	function flatpickr_1_value_binding(value) {
    		/*flatpickr_1_value_binding*/ ctx[15].call(null, value);
    	}

    	function flatpickr_1_formattedValue_binding(value) {
    		/*flatpickr_1_formattedValue_binding*/ ctx[16].call(null, value);
    	}

    	function flatpickr_1_flatpickr_binding(value) {
    		/*flatpickr_1_flatpickr_binding*/ ctx[17].call(null, value);
    	}

    	let flatpickr_1_props = {
    		name: "date",
    		options: /*flatpickrOptions*/ ctx[10]
    	};

    	if (/*dValue*/ ctx[2] !== void 0) {
    		flatpickr_1_props.value = /*dValue*/ ctx[2];
    	}

    	if (/*formattedValue*/ ctx[3] !== void 0) {
    		flatpickr_1_props.formattedValue = /*formattedValue*/ ctx[3];
    	}

    	if (/*flatpickr*/ ctx[4] !== void 0) {
    		flatpickr_1_props.flatpickr = /*flatpickr*/ ctx[4];
    	}

    	flatpickr_1 = new Flatpickr({ props: flatpickr_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(flatpickr_1, "value", flatpickr_1_value_binding));
    	binding_callbacks.push(() => bind(flatpickr_1, "formattedValue", flatpickr_1_formattedValue_binding));
    	binding_callbacks.push(() => bind(flatpickr_1, "flatpickr", flatpickr_1_flatpickr_binding));

    	tags = new Tags({
    			props: {
    				tags: /*navCategories*/ ctx[6],
    				autoComplete: /*masterCategories*/ ctx[7]
    			},
    			$$inline: true
    		});

    	tags.$on("tags", /*changeTags*/ ctx[11]);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Title";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Subtitle A";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Date";
    			t7 = space();
    			create_component(flatpickr_1.$$.fragment);
    			t8 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Subtitle B";
    			t10 = space();
    			input2 = element("input");
    			t11 = space();
    			div4 = element("div");
    			label4 = element("label");
    			label4.textContent = "Nav Categories";
    			t13 = space();
    			create_component(tags.$$.fragment);
    			attr_dev(label0, "for", "gallery-title");
    			attr_dev(label0, "class", "svelte-d753hn");
    			add_location(label0, file$a, 93, 16, 2723);
    			attr_dev(input0, "id", "gallery-title");
    			add_location(input0, file$a, 94, 16, 2781);
    			attr_dev(div0, "class", "entry-block svelte-d753hn");
    			add_location(div0, file$a, 92, 12, 2680);
    			attr_dev(label1, "for", "gallery-subtitle_A");
    			attr_dev(label1, "class", "svelte-d753hn");
    			add_location(label1, file$a, 99, 16, 2963);
    			attr_dev(input1, "id", "gallery-subtitle_A");
    			add_location(input1, file$a, 100, 16, 3031);
    			attr_dev(div1, "class", "entry-block svelte-d753hn");
    			add_location(div1, file$a, 98, 12, 2920);
    			attr_dev(label2, "for", "gallery-date");
    			attr_dev(label2, "class", "svelte-d753hn");
    			add_location(label2, file$a, 105, 16, 3223);
    			attr_dev(div2, "class", "entry-block svelte-d753hn");
    			add_location(div2, file$a, 104, 12, 3180);
    			attr_dev(label3, "for", "gallery-subtitle_B");
    			attr_dev(label3, "class", "svelte-d753hn");
    			add_location(label3, file$a, 114, 16, 3551);
    			attr_dev(input2, "id", "gallery-subtitle_B");
    			add_location(input2, file$a, 115, 16, 3619);
    			attr_dev(div3, "class", "entry-block svelte-d753hn");
    			add_location(div3, file$a, 113, 12, 3508);
    			attr_dev(label4, "for", "gallery-nav-categories");
    			attr_dev(label4, "class", "svelte-d753hn");
    			add_location(label4, file$a, 120, 17, 3819);
    			attr_dev(div4, "class", "entry-block double svelte-d753hn");
    			add_location(div4, file$a, 119, 12, 3768);
    			attr_dev(div5, "class", "control-panel-frame svelte-d753hn");
    			add_location(div5, file$a, 90, 8, 2586);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			set_input_value(input0, /*$GalleryStore*/ ctx[1].title);
    			append_dev(div5, t2);
    			append_dev(div5, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t4);
    			append_dev(div1, input1);
    			set_input_value(input1, /*$GalleryStore*/ ctx[1].subtitle_A);
    			append_dev(div5, t5);
    			append_dev(div5, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t7);
    			mount_component(flatpickr_1, div2, null);
    			append_dev(div5, t8);
    			append_dev(div5, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t10);
    			append_dev(div3, input2);
    			set_input_value(input2, /*$GalleryStore*/ ctx[1].subtitle_B);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, label4);
    			append_dev(div4, t13);
    			mount_component(tags, div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "blur", /*onPanelBlur*/ ctx[12], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[13]),
    					listen_dev(input1, "blur", /*onPanelBlur*/ ctx[12], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[14]),
    					listen_dev(input2, "blur", /*onPanelBlur*/ ctx[12], false, false, false),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[18])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$GalleryStore*/ 2 && input0.value !== /*$GalleryStore*/ ctx[1].title) {
    				set_input_value(input0, /*$GalleryStore*/ ctx[1].title);
    			}

    			if (dirty & /*$GalleryStore*/ 2 && input1.value !== /*$GalleryStore*/ ctx[1].subtitle_A) {
    				set_input_value(input1, /*$GalleryStore*/ ctx[1].subtitle_A);
    			}

    			const flatpickr_1_changes = {};

    			if (!updating_value && dirty & /*dValue*/ 4) {
    				updating_value = true;
    				flatpickr_1_changes.value = /*dValue*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			if (!updating_formattedValue && dirty & /*formattedValue*/ 8) {
    				updating_formattedValue = true;
    				flatpickr_1_changes.formattedValue = /*formattedValue*/ ctx[3];
    				add_flush_callback(() => updating_formattedValue = false);
    			}

    			if (!updating_flatpickr && dirty & /*flatpickr*/ 16) {
    				updating_flatpickr = true;
    				flatpickr_1_changes.flatpickr = /*flatpickr*/ ctx[4];
    				add_flush_callback(() => updating_flatpickr = false);
    			}

    			flatpickr_1.$set(flatpickr_1_changes);

    			if (dirty & /*$GalleryStore*/ 2 && input2.value !== /*$GalleryStore*/ ctx[1].subtitle_B) {
    				set_input_value(input2, /*$GalleryStore*/ ctx[1].subtitle_B);
    			}

    			const tags_changes = {};
    			if (dirty & /*navCategories*/ 64) tags_changes.tags = /*navCategories*/ ctx[6];
    			if (dirty & /*masterCategories*/ 128) tags_changes.autoComplete = /*masterCategories*/ ctx[7];
    			tags.$set(tags_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(flatpickr_1.$$.fragment, local);
    			transition_in(tags.$$.fragment, local);

    			add_render_callback(() => {
    				if (div5_outro) div5_outro.end(1);
    				if (!div5_intro) div5_intro = create_in_transition(div5, fly, /*flyAnimation*/ ctx[8]);
    				div5_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(flatpickr_1.$$.fragment, local);
    			transition_out(tags.$$.fragment, local);
    			if (div5_intro) div5_intro.invalidate();
    			div5_outro = create_out_transition(div5, fly, /*flyAnimation*/ ctx[8]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(flatpickr_1);
    			destroy_component(tags);
    			if (detaching && div5_outro) div5_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(90:4) {#if open}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div0;
    	let mdlist;
    	let t;
    	let div1;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	mdlist = new MdList({ $$inline: true });
    	let if_block = /*open*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(mdlist.$$.fragment);
    			t = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "panel-toggle svelte-d753hn");
    			add_location(div0, file$a, 86, 0, 2463);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*controlPanelClass*/ ctx[5]) + " svelte-d753hn"));
    			add_location(div1, file$a, 88, 0, 2529);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(mdlist, div0, null);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			if (if_block) if_block.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*onToggle*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*open*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*open*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*controlPanelClass*/ 32 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*controlPanelClass*/ ctx[5]) + " svelte-d753hn"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdlist.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdlist.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(mdlist);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
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
    	let $GalleryStore;
    	validate_store(GalleryStore, "GalleryStore");
    	component_subscribe($$self, GalleryStore, $$value => $$invalidate(1, $GalleryStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ControlPanel", slots, []);
    	window.NAV_DATA = window.NAV_DATA || {};
    	window.NAV_DATA.categories = window.NAV_DATA.categories || ["Africa", "Americas", "Asia", "Europe", "Middle East", "Southeast Asia"];
    	const flyAnimation = { y: -200, duration: 550 };
    	const dummyArray = [];

    	const onToggle = () => {
    		GalleryStore.toggleControlPanel();
    	};

    	const getDate = store => {
    		const date = store.date;

    		if (flatpickr) {
    			flatpickr.setDate(dateValue);
    		}

    		return date;
    	};

    	const refreshCategories = store => {
    		if (!store.navCategories && !window.NAV_DATA) {
    			return dummyArray;
    		}

    		return [
    			...store.navCategories || dummyArray,
    			...window.NAV_DATA
    			? window.NAV_DATA.categories
    			: dummyArray
    		];
    	};

    	const refreshOpen = store => {
    		if (!store.controlPanelOpen) {
    			$$invalidate(4, flatpickr = undefined);
    		}

    		return store.controlPanelOpen;
    	};

    	let dValue, formattedValue, flatpickr;

    	const flatpickrOptions = {
    		dateFormat: "Y M d",
    		onChange(selectedDates, dateStr) {
    			dateValue = dateStr;
    			onPanelBlur();
    		},
    		onReady: () => {
    			setTimeout(() => flatpickr.setDate(dateValue), 100);
    		}
    	};

    	const changeTags = event => {
    		let tags = event.detail.tags;
    		tags = tags.toString().split(",").map(d => d.trim());
    		$$invalidate(6, navCategories = tags);
    		onPanelBlur();
    	};

    	const onPanelBlur = e => {
    		if (e) {
    			console.log("event!", e);
    		}

    		GalleryStore.updateMeta({ date: dateValue, navCategories });
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<ControlPanel> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		$GalleryStore.title = this.value;
    		GalleryStore.set($GalleryStore);
    	}

    	function input1_input_handler() {
    		$GalleryStore.subtitle_A = this.value;
    		GalleryStore.set($GalleryStore);
    	}

    	function flatpickr_1_value_binding(value) {
    		dValue = value;
    		$$invalidate(2, dValue);
    	}

    	function flatpickr_1_formattedValue_binding(value) {
    		formattedValue = value;
    		$$invalidate(3, formattedValue);
    	}

    	function flatpickr_1_flatpickr_binding(value) {
    		flatpickr = value;
    		$$invalidate(4, flatpickr);
    	}

    	function input2_input_handler() {
    		$GalleryStore.subtitle_B = this.value;
    		GalleryStore.set($GalleryStore);
    	}

    	$$self.$capture_state = () => ({
    		fly,
    		MdList,
    		GalleryStore,
    		Flatpickr,
    		Tags,
    		flyAnimation,
    		dummyArray,
    		onToggle,
    		getDate,
    		refreshCategories,
    		refreshOpen,
    		dValue,
    		formattedValue,
    		flatpickr,
    		flatpickrOptions,
    		changeTags,
    		onPanelBlur,
    		dateValue,
    		open,
    		$GalleryStore,
    		controlPanelClass,
    		navCategories,
    		masterCategories
    	});

    	$$self.$inject_state = $$props => {
    		if ("dValue" in $$props) $$invalidate(2, dValue = $$props.dValue);
    		if ("formattedValue" in $$props) $$invalidate(3, formattedValue = $$props.formattedValue);
    		if ("flatpickr" in $$props) $$invalidate(4, flatpickr = $$props.flatpickr);
    		if ("dateValue" in $$props) dateValue = $$props.dateValue;
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("controlPanelClass" in $$props) $$invalidate(5, controlPanelClass = $$props.controlPanelClass);
    		if ("navCategories" in $$props) $$invalidate(6, navCategories = $$props.navCategories);
    		if ("masterCategories" in $$props) $$invalidate(7, masterCategories = $$props.masterCategories);
    	};

    	let open;
    	let controlPanelClass;
    	let dateValue;
    	let navCategories;
    	let masterCategories;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$GalleryStore*/ 2) {
    			 $$invalidate(0, open = refreshOpen($GalleryStore));
    		}

    		if ($$self.$$.dirty & /*open*/ 1) {
    			 $$invalidate(5, controlPanelClass = "control-panel" + (open ? " open" : ""));
    		}

    		if ($$self.$$.dirty & /*$GalleryStore*/ 2) {
    			 dateValue = getDate($GalleryStore);
    		}

    		if ($$self.$$.dirty & /*$GalleryStore*/ 2) {
    			 $$invalidate(6, navCategories = $GalleryStore.navCategories || []);
    		}

    		if ($$self.$$.dirty & /*$GalleryStore*/ 2) {
    			 $$invalidate(7, masterCategories = refreshCategories($GalleryStore));
    		}
    	};

    	return [
    		open,
    		$GalleryStore,
    		dValue,
    		formattedValue,
    		flatpickr,
    		controlPanelClass,
    		navCategories,
    		masterCategories,
    		flyAnimation,
    		onToggle,
    		flatpickrOptions,
    		changeTags,
    		onPanelBlur,
    		input0_input_handler,
    		input1_input_handler,
    		flatpickr_1_value_binding,
    		flatpickr_1_formattedValue_binding,
    		flatpickr_1_flatpickr_binding,
    		input2_input_handler
    	];
    }

    class ControlPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ControlPanel",
    			options,
    			id: create_fragment$a.name
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
    const SHADOW_ELEMENT_ATTRIBUTE_NAME = "data-is-dnd-shadow-item";

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

    let dzToShadowIndexToRect;

    /**
     * Resets the cache that allows for smarter "would be index" resolution. Should be called after every drag operation
     */
    function resetIndexesCache() {
        dzToShadowIndexToRect = new Map();
    }
    resetIndexesCache();

    /**
     * Caches the coordinates of the shadow element when it's in a certain index in a certain dropzone.
     * Helpful in order to determine "would be index" more effectively
     * @param {HTMLElement} dz
     * @return {number} - the shadow element index
     */
    function cacheShadowRect(dz) {
        const shadowElIndex = Array.from(dz.children).findIndex(child => child.getAttribute(SHADOW_ELEMENT_ATTRIBUTE_NAME));
        if (shadowElIndex >= 0) {
            if (!dzToShadowIndexToRect.has(dz)) {
                dzToShadowIndexToRect.set(dz, new Map());
            }
            dzToShadowIndexToRect.get(dz).set(shadowElIndex, getAbsoluteRectNoTransforms(dz.children[shadowElIndex]));
            return shadowElIndex;
        }
        return undefined;
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
        const shadowElIndex = cacheShadowRect(collectionBelowEl);

        // the search could be more efficient but keeping it simple for now
        // a possible improvement: pass in the lastIndex it was found in and check there first, then expand from there
        for (let i = 0; i < children.length; i++) {
            if (isCenterOfAInsideB(floatingAboveEl, children[i])) {
                const cachedShadowRect = dzToShadowIndexToRect.has(collectionBelowEl) && dzToShadowIndexToRect.get(collectionBelowEl).get(i);
                if (cachedShadowRect) {
                    if (!isPointInsideRect(findCenterOfElement(floatingAboveEl), cachedShadowRect)) {
                        return {index: shadowElIndex, isProximityBased: false};
                    }
                }
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
        resetIndexesCache();
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
        copyStylesRecursively(copyFromEl, draggedEl);
        transformDraggedElement();
    }

    /**
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
     * @param {HTMLElement} copyFromEl
     * @param {HTMLElement} copyToEl
     */
    function copyStylesRecursively(copyFromEl, copyToEl) {
        copyStylesFromTo(copyFromEl, copyToEl);
        if ((copyFromEl.children || []).length !== (copyToEl.children || []).length) {
            throw new Error("got corrupted dragged element");
        }
        if (!copyFromEl.children) return;
        for (let i = 0; i < copyFromEl.children.length; i++) {
            copyStylesRecursively(copyFromEl.children[i], copyToEl.children[i]);
        }
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
    function decorateShadowEl(shadowEl) {
        shadowEl.style.visibility = "hidden";
        shadowEl.setAttribute(SHADOW_ELEMENT_ATTRIBUTE_NAME, "true");
    }

    /**
     * undo the styles the shadow element
     * @param {HTMLElement} shadowEl
     */
    function unDecorateShadowElement(shadowEl) {
        shadowEl.style.visibility = "";
        shadowEl.removeAttribute(SHADOW_ELEMENT_ATTRIBUTE_NAME);
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
                unDecorateShadowElement(shadowElDropZone.children[shadowElIdx]);
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
                unDecorateShadowElement(shadowElDropZone.children[originIndex]);
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
                    decorateShadowEl(draggableEl);
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
        window.addEventListener("DOMContentLoaded", () => {
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
        });
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
        if (focusedDz === dropZoneEl) {
            handleDrop$1();
        }
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
            setCurrentFocusedItem(e.currentTarget);
            focusedDz = node;
            draggedItemType = config.type;
            isDragging = true;
            const dropTargets = Array.from(typeToDropZones$1.get(config.type)).filter(dz => dz === focusedDz || !dzToConfig$1.get(dz).dropFromOthersDisabled);
            styleActiveDropZones(dropTargets, dz => dzToConfig$1.get(dz).dropTargetStyle);
            if (!config.autoAriaDisabled) {
                let msg = `Started dragging item ${focusedItemLabel}. Use the arrow keys to move it within its list ${focusedDzLabel}`;
                if (dropTargets.length > 1) {
                    msg += `, or tab to another list in order to move the item into it`;
                }
                alertToScreenReader(msg);
            }
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

    /* templates\components\gallery\Intersector.svelte generated by Svelte v3.31.0 */
    const file$b = "templates\\components\\gallery\\Intersector.svelte";
    const get_default_slot_changes = dirty => ({ intersecting: dirty & /*intersecting*/ 1 });
    const get_default_slot_context = ctx => ({ intersecting: /*intersecting*/ ctx[0] });

    function create_fragment$b(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-1hzn8rv");
    			add_location(div, file$b, 31, 0, 946);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
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
    			id: create_fragment$b.name
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

    /* templates\components\gallery\GalleryImage.svelte generated by Svelte v3.31.0 */
    const file$c = "templates\\components\\gallery\\GalleryImage.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i][0];
    	child_ctx[25] = list[i][1];
    	child_ctx[26] = list[i][2];
    	child_ctx[27] = list[i][3];
    	child_ctx[28] = list[i][4];
    	child_ctx[29] = list[i][5];
    	return child_ctx;
    }

    // (58:4) {#if !loaded}
    function create_if_block$4(ctx) {
    	let div;
    	let svg;
    	let g;
    	let svg_viewBox_value;
    	let div_class_value;
    	let div_outro;
    	let current;
    	let if_block = !/*loaded*/ ctx[1] && create_if_block_1$2(ctx);
    	let each_value = /*svgSequence*/ ctx[7];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
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

    			add_location(g, file$c, 65, 16, 2304);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*svgWidth*/ ctx[2] + " " + /*svgHeight*/ ctx[8]);
    			attr_dev(svg, "style", /*svgScale*/ ctx[10]);
    			add_location(svg, file$c, 59, 12, 1931);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*photoSvgClass*/ ctx[9]) + " svelte-1sginmh"));
    			add_location(div, file$c, 58, 8, 1869);
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
    					if_block = create_if_block_1$2(ctx);
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
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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

    			if (!current || dirty[0] & /*photoSvgClass*/ 512 && div_class_value !== (div_class_value = "" + (null_to_empty(/*photoSvgClass*/ ctx[9]) + " svelte-1sginmh"))) {
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
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(58:4) {#if !loaded}",
    		ctx
    	});

    	return block;
    }

    // (62:16) {#if !loaded}
    function create_if_block_1$2(ctx) {
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
    			add_location(rect, file$c, 62, 20, 2146);
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
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(62:16) {#if !loaded}",
    		ctx
    	});

    	return block;
    }

    // (67:20) {#each svgSequence as [ fill, opacity, cx, cy, rx, ry ] }
    function create_each_block$2(ctx) {
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
    			add_location(ellipse, file$c, 67, 24, 2412);
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(67:20) {#each svgSequence as [ fill, opacity, cx, cy, rx, ry ] }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let img;
    	let img_src_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = !/*loaded*/ ctx[1] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			img = element("img");
    			attr_dev(div0, "class", "photo-spacer svelte-1sginmh");
    			attr_dev(div0, "style", /*spacerStyle*/ ctx[5]);
    			add_location(div0, file$c, 74, 4, 2579);
    			if (img.src !== (img_src_value = /*src*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "srcset", /*srcset*/ ctx[4]);
    			attr_dev(img, "alt", /*alt*/ ctx[6]);
    			attr_dev(img, "class", "svelte-1sginmh");
    			toggle_class(img, "show", /*show*/ ctx[0]);
    			add_location(img, file$c, 75, 4, 2633);
    			attr_dev(div1, "class", "photo-inner-frame svelte-1sginmh");
    			add_location(div1, file$c, 55, 0, 1807);
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
    					if_block = create_if_block$4(ctx);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
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
    			 $$invalidate(6, alt = data.title ? data.title : "image");
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
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { viewLightbox: 15, imgData: 16, show: 0 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GalleryImage",
    			options,
    			id: create_fragment$c.name
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

    let t = {};

    const exec = (command, value = null) => {
      document.execCommand(command, false, value);
    };

    const getTagsRecursive = (element, tags) => {
      tags = tags || (element && element.tagName ? [element.tagName] : []);

      if (element && element.parentNode) {
        element = element.parentNode;
      } else {
        return tags;
      }

      const tag = element.tagName;
      if (element.style && element.getAttribute) {
        [element.style.textAlign || element.getAttribute('align'), element.style.color || tag === 'FONT' && 'forecolor', element.style.backgroundColor && 'backcolor']
          .filter((item) => item)
          .forEach((item) => tags.push(item));
      }

      if (tag === 'DIV') {
        return tags;
      }

      tags.push(tag);

      return getTagsRecursive(element, tags).filter((_tag) => _tag != null);
    };

    const saveRange = (editor) => {
      const documentSelection = document.getSelection();

      t.range = null;

      if (documentSelection.rangeCount) {
          let savedRange = t.range = documentSelection.getRangeAt(0);
          let range = document.createRange();
          let rangeStart;
          range.selectNodeContents(editor);
          range.setEnd(savedRange.startContainer, savedRange.startOffset);
          rangeStart = (range + '').length;
          t.metaRange = {
              start: rangeStart,
              end: rangeStart + (savedRange + '').length
          };
      }
    };
    const restoreRange = (editor) => {
      let metaRange = t.metaRange;
      let savedRange = t.range;
      let documentSelection = document.getSelection();
      let range;

      if (!savedRange) {
          return;
      }

      if (metaRange && metaRange.start !== metaRange.end) { // Algorithm from http://jsfiddle.net/WeWy7/3/
          let charIndex = 0,
              nodeStack = [editor],
              node,
              foundStart = false,
              stop = false;

          range = document.createRange();

          while (!stop && (node = nodeStack.pop())) {
              if (node.nodeType === 3) {
                  let nextCharIndex = charIndex + node.length;
                  if (!foundStart && metaRange.start >= charIndex && metaRange.start <= nextCharIndex) {
                      range.setStart(node, metaRange.start - charIndex);
                      foundStart = true;
                  }
                  if (foundStart && metaRange.end >= charIndex && metaRange.end <= nextCharIndex) {
                      range.setEnd(node, metaRange.end - charIndex);
                      stop = true;
                  }
                  charIndex = nextCharIndex;
              } else {
                  let cn = node.childNodes;
                  let i = cn.length;

                  while (i > 0) {
                      i -= 1;
                      nodeStack.push(cn[i]);
                  }
              }
          }
      }

      documentSelection.removeAllRanges();
      documentSelection.addRange(range || savedRange);
    };

    const cleanHtml = (input) => {
      const html = input.match(/<!--StartFragment-->(.*?)<!--EndFragment-->/);
      let output = html && html[1] || input;
      output = output
        .replace(/\r?\n|\r/g, ' ')
        .replace(/<!--(.*?)-->/g, '')
        .replace(new RegExp('<(/)*(meta|link|span|\\?xml:|st1:|o:|font|w:sdt)(.*?)>', 'gi'), '')
        .replace(/<!\[if !supportLists\]>(.*?)<!\[endif\]>/gi, '')
        .replace(/style="[^"]*"/gi, '')
        .replace(/style='[^']*'/gi, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/>(\s+)</g, '><')
        .replace(/class="[^"]*"/gi, '')
        .replace(/class='[^']*'/gi, '')
        .replace(/<[^/].*?>/g, i => i.split(/[ >]/g)[0] + '>')
        .trim();

        output = removeBadTags(output);
        return output;
    };

    const unwrap = (wrapper) => {
    	const docFrag = document.createDocumentFragment();
    	while (wrapper.firstChild) {
    		const child = wrapper.removeChild(wrapper.firstChild);
    		docFrag.appendChild(child);
    	}

    	// replace wrapper with document fragment
    	wrapper.parentNode.replaceChild(docFrag, wrapper);
    };

    const removeBlockTagsRecursive = (elements, tagsToRemove) => {
      Array.from(elements).forEach((item) => {
        if (tagsToRemove.some((tag) => tag === item.tagName.toLowerCase())) {
          if (item.children.length) {
            removeBlockTagsRecursive(item.children, tagsToRemove);
          }
          unwrap(item);
        }
      });
    };

    const getActionBtns = (actions) => {
      return Object.keys(actions).map((action) => actions[action]);
    };

    const getNewActionObj = (actions, userActions = []) => {
        if (userActions && userActions.length) {
            const newActions = {};
            userActions.forEach((action) => {
                if (typeof action === 'string') {
                    newActions[action] = Object.assign({}, actions[action]);
                } else if (actions[action.name]) {
                    newActions[action.name] = Object.assign(actions[action.name], action);
                } else {
                    newActions[action.name] = Object.assign({}, action);
                }
            });

            return newActions;
        } else {
            return actions;
        }
    };

    const removeBadTags = (html) => {
        ['style', 'script', 'applet', 'embed', 'noframes', 'noscript'].forEach((badTag) => {
            html = html.replace(new RegExp(`<${badTag}.*?${badTag}(.*?)>`, 'gi'), '');
        });

        return html;
    };

    const isEditorClick = (target, editorWrapper) => {
        if (target === editorWrapper) {
            return true;
        }
        if (target.parentElement) {
            return isEditorClick(target.parentElement, editorWrapper);
        }
        return false;
    };

    const linkSvg =
    	'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M31.1 48.9l-6.7 6.7c-.8.8-1.6.9-2.1.9s-1.4-.1-2.1-.9L15 50.4c-1.1-1.1-1.1-3.1 0-4.2l6.1-6.1.2-.2 6.5-6.5c-1.2-.6-2.5-.9-3.8-.9-2.3 0-4.6.9-6.3 2.6L11 41.8c-3.5 3.5-3.5 9.2 0 12.7l5.2 5.2c1.7 1.7 4 2.6 6.3 2.6s4.6-.9 6.3-2.6l6.7-6.7c2.5-2.6 3.1-6.7 1.5-10l-5.9 5.9zM38.7 22.5l6.7-6.7c.8-.8 1.6-.9 2.1-.9s1.4.1 2.1.9l5.2 5.2c1.1 1.1 1.1 3.1 0 4.2l-6.1 6.1-.2.2L42 38c1.2.6 2.5.9 3.8.9 2.3 0 4.6-.9 6.3-2.6l6.7-6.7c3.5-3.5 3.5-9.2 0-12.7l-5.2-5.2c-1.7-1.7-4-2.6-6.3-2.6s-4.6.9-6.3 2.6l-6.7 6.7c-2.7 2.7-3.3 6.9-1.7 10.2l6.1-6.1c0 .1 0 .1 0 0z"></path><path d="M44.2 30.5c.2-.2.4-.6.4-.9 0-.3-.1-.6-.4-.9l-2.3-2.3c-.3-.2-.6-.4-.9-.4-.3 0-.6.1-.9.4L25.9 40.6c-.2.2-.4.6-.4.9 0 .3.1.6.4.9l2.3 2.3c.2.2.6.4.9.4.3 0 .6-.1.9-.4l14.2-14.2zM49.9 55.4h-8.5v-5h8.5v-8.9h5.2v8.9h8.5v5h-8.5v8.9h-5.2v-8.9z"></path></svg>';
    const unlinkSvg =
    	'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M30.9 49.1l-6.7 6.7c-.8.8-1.6.9-2.1.9s-1.4-.1-2.1-.9l-5.2-5.2c-1.1-1.1-1.1-3.1 0-4.2l6.1-6.1.2-.2 6.5-6.5c-1.2-.6-2.5-.9-3.8-.9-2.3 0-4.6.9-6.3 2.6L10.8 42c-3.5 3.5-3.5 9.2 0 12.7l5.2 5.2c1.7 1.7 4 2.6 6.3 2.6s4.6-.9 6.3-2.6l6.7-6.7C38 50.5 38.6 46.3 37 43l-6.1 6.1zM38.5 22.7l6.7-6.7c.8-.8 1.6-.9 2.1-.9s1.4.1 2.1.9l5.2 5.2c1.1 1.1 1.1 3.1 0 4.2l-6.1 6.1-.2.2-6.5 6.5c1.2.6 2.5.9 3.8.9 2.3 0 4.6-.9 6.3-2.6l6.7-6.7c3.5-3.5 3.5-9.2 0-12.7l-5.2-5.2c-1.7-1.7-4-2.6-6.3-2.6s-4.6.9-6.3 2.6l-6.7 6.7c-2.7 2.7-3.3 6.9-1.7 10.2l6.1-6.1z"></path><path d="M44.1 30.7c.2-.2.4-.6.4-.9 0-.3-.1-.6-.4-.9l-2.3-2.3c-.2-.2-.6-.4-.9-.4-.3 0-.6.1-.9.4L25.8 40.8c-.2.2-.4.6-.4.9 0 .3.1.6.4.9l2.3 2.3c.2.2.6.4.9.4.3 0 .6-.1.9-.4l14.2-14.2zM41.3 55.8v-5h22.2v5H41.3z"></path></svg>';

    var defaultActions = {
    	viewHtml: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path fill="none" stroke="currentColor" stroke-width="8" stroke-miterlimit="10" d="M26.9 17.9L9 36.2 26.9 54M45 54l17.9-18.3L45 17.9"></path></svg>',
    		title: "View HTML",
    		result: function() {
    			let refs = get_store_value(this.references);
    			let actionObj = get_store_value(this.state).actionObj;
    			let helper = get_store_value(this.helper);

    			helper.showEditor = !helper.showEditor;
    			refs.editor.style.display = helper.showEditor ? "block" : "none";
    			refs.raw.style.display = helper.showEditor ? "none" : "block";
    			if (helper.showEditor) {
    				refs.editor.innerHTML = refs.raw.value;
    			} else {
    				refs.raw.value = refs.editor.innerHTML;
    			}
    			setTimeout(() => {
    				Object.keys(actionObj).forEach(
    					action => (actionObj[action].disabled = !helper.showEditor)
    				);
    				actionObj.viewHtml.disabled = false;
    				actionObj.viewHtml.active = !helper.showEditor;

    				this.state.update(state => {
    					state.actionBtns = getActionBtns(actionObj);
    					state.actionObj = actionObj;
    					return state;
    				});
    			});
    		}
    	},
    	undo: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M61.2 51.2c0-5.1-2.1-9.7-5.4-13.1-3.3-3.3-8-5.4-13.1-5.4H26.1v-12L10.8 36l15.3 15.3V39.1h16.7c3.3 0 6.4 1.3 8.5 3.5 2.2 2.2 3.5 5.2 3.5 8.5h6.4z"></path></svg>',
    		title: "Undo",
    		result: () => exec("undo")
    	},
    	redo: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M10.8 51.2c0-5.1 2.1-9.7 5.4-13.1 3.3-3.3 8-5.4 13.1-5.4H46v-12L61.3 36 45.9 51.3V39.1H29.3c-3.3 0-6.4 1.3-8.5 3.5-2.2 2.2-3.5 5.2-3.5 8.5h-6.5z"></path></svg>',
    		title: "Redo",
    		result: () => exec("redo")
    	},
    	b: {
    		icon: "<b>B</b>",
    		title: "Bold",
    		result: () => exec("bold")
    	},
    	i: {
    		icon: "<i>I</i>",
    		title: "Italic",
    		result: () => exec("italic")
    	},
    	u: {
    		icon: "<u>U</u>",
    		title: "Underline",
    		result: () => exec("underline")
    	},
    	strike: {
    		icon: "<strike>S</strike>",
    		title: "Strike-through",
    		result: () => exec("strikeThrough")
    	},
    	sup: {
    		icon: "A<sup>2</sup>",
    		title: "Superscript",
    		result: () => exec("superscript")
    	},
    	sub: {
    		icon: "A<sub>2</sub>",
    		title: "Subscript",
    		result: () => exec("subscript")
    	},
    	h1: {
    		icon: "<b>H<sub>1</sub></b>",
    		title: "Heading 1",
    		result: () => exec("formatBlock", "<H1>")
    	},
    	h2: {
    		icon: "<b>H<sub>2</sub></b>",
    		title: "Heading 2",
    		result: () => exec("formatBlock", "<H2>")
    	},
    	p: {
    		icon: "&#182;",
    		title: "Paragraph",
    		result: () => exec("formatBlock", "<P>")
    	},
    	blockquote: {
    		icon: "&#8220; &#8221;",
    		title: "Quote",
    		result: () => exec("formatBlock", "<BLOCKQUOTE>")
    	},
    	ol: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M27 14h36v8H27zM27 50h36v8H27zM27 32h36v8H27zM11.8 15.8V22h1.8v-7.8h-1.5l-2.1 1 .3 1.3zM12.1 38.5l.7-.6c1.1-1 2.1-2.1 2.1-3.4 0-1.4-1-2.4-2.7-2.4-1.1 0-2 .4-2.6.8l.5 1.3c.4-.3 1-.6 1.7-.6.9 0 1.3.5 1.3 1.1 0 .9-.9 1.8-2.6 3.3l-1 .9V40H15v-1.5h-2.9zM13.3 53.9c1-.4 1.4-1 1.4-1.8 0-1.1-.9-1.9-2.6-1.9-1 0-1.9.3-2.4.6l.4 1.3c.3-.2 1-.5 1.6-.5.8 0 1.2.3 1.2.8 0 .7-.8.9-1.4.9h-.7v1.3h.7c.8 0 1.6.3 1.6 1.1 0 .6-.5 1-1.4 1-.7 0-1.5-.3-1.8-.5l-.4 1.4c.5.3 1.3.6 2.3.6 2 0 3.2-1 3.2-2.4 0-1.1-.8-1.8-1.7-1.9z"></path></svg>',
    		title: "Ordered List",
    		result: () => exec("insertOrderedList")
    	},
    	ul: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M27 14h36v8H27zM27 50h36v8H27zM9 50h9v8H9zM9 32h9v8H9zM9 14h9v8H9zM27 32h36v8H27z"></path></svg>',
    		title: "Unordered List",
    		result: () => exec("insertUnorderedList")
    	},
    	hr: {
    		icon: "&#8213;",
    		title: "Horizontal Line",
    		result: () => exec("insertHorizontalRule")
    	},
    	left: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM9 32h36v8H9z"></path></svg>',
    		title: "Justify left",
    		result: () => exec("justifyLeft")
    	},
    	right: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM27 32h36v8H27z"></path></svg>',
    		title: "Justify right",
    		result: () => exec("justifyRight")
    	},
    	center: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM18 32h36v8H18z"></path></svg>',
    		title: "Justify center",
    		result: () => exec("justifyCenter")
    	},
    	justify: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM9 32h54v8H9z"></path></svg>',
    		title: "Justify full",
    		result: () => exec("justifyFull")
    	},
    	a: {
    		icon: linkSvg,
    		title: "Insert link",
    		result: function() {
    			const actionObj = get_store_value(this.state).actionObj;
    			const refs = get_store_value(this.references);

    			if (actionObj.a.active) {
    				const selection = window.getSelection();
    				const range = document.createRange();
    				range.selectNodeContents(document.getSelection().focusNode);
    				selection.removeAllRanges();
    				selection.addRange(range);
    				exec("unlink");
    				actionObj.a.title = "Insert link";
    				actionObj.a.icon = linkSvg;
    				this.state.update(state => {
    					state.actionBtn = getActionBtns(actionObj);
    					state.actionObj = actionObj;
    					return state;
    				});
    			} else {
    				saveRange(refs.editor);
    				refs.modal.$set({
    					show: true,
    					event: "linkUrl",
    					title: "Insert link",
    					label: "Url"
    				});
    				if (!get_store_value(this.helper).link) {
    					this.helper.update(state => {
    						state.link = true;
    						return state;
    					});
    					refs.modal.$on("linkUrl", event => {
    						restoreRange(refs.editor);
    						exec("createLink", event.detail);
    						actionObj.a.title = "Unlink";
    						actionObj.a.icon = unlinkSvg;

    						this.state.update(state => {
    							state.actionBtn = getActionBtns(actionObj);
    							state.actionObj = actionObj;
    							return state;
    						});
    					});
    				}
    			}
    		}
    	},
    	image: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M64 17v38H8V17h56m8-8H0v54h72V9z"></path><path d="M17.5 22C15 22 13 24 13 26.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zM16 50h27L29.5 32zM36 36.2l8.9-8.5L60.2 50H45.9S35.6 35.9 36 36.2z"></path></svg>',
    		title: "Image",
    		result: function() {
    			const actionObj = get_store_value(this.state).actionObj;
    			const refs = get_store_value(this.references);
    			saveRange(refs.editor);
    			refs.modal.$set({
    				show: true,
    				event: "imageUrl",
    				title: "Insert image",
    				label: "Url"
    			});
    			if (!get_store_value(this.helper).image) {
    				this.helper.update(state => {
    					state.image = true;
    					return state;
    				});
    				refs.modal.$on("imageUrl", event => {
    					restoreRange(refs.editor);
    					exec("insertImage", event.detail);
    				});
    			}
    		}
    	},
    	forecolor: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M32 15h7.8L56 57.1h-7.9l-4-11.1H27.4l-4 11.1h-7.6L32 15zm-2.5 25.4h12.9L36 22.3h-.2l-6.3 18.1z"></path></svg>',
    		title: "Text color",
    		colorPicker: true,
    		result: function() {
    			showColorPicker.call(this, "foreColor");
    		}
    	},
    	backcolor: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M36.5 22.3l-6.3 18.1H43l-6.3-18.1z"></path><path d="M9 8.9v54.2h54.1V8.9H9zm39.9 48.2L45 46H28.2l-3.9 11.1h-7.6L32.8 15h7.8l16.2 42.1h-7.9z"></path></svg>',
    		title: "Background color",
    		colorPicker: true,
    		result: function() {
    			showColorPicker.call(this, "backColor");
    		}
    	},
    	removeFormat: {
    		icon:
    			'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M58.2 54.6L52 48.5l3.6-3.6 6.1 6.1 6.4-6.4 3.8 3.8-6.4 6.4 6.1 6.1-3.6 3.6-6.1-6.1-6.4 6.4-3.7-3.8 6.4-6.4zM21.7 52.1H50V57H21.7zM18.8 15.2h34.1v6.4H39.5v24.2h-7.4V21.5H18.8v-6.3z"></path></svg>',
    		title: "Remove format",
    		result: function() {
    			const refs = get_store_value(this.references);
    			const selection = window.getSelection();
    			if (!selection.toString().length) {
    				removeBlockTagsRecursive(
    					refs.editor.children,
    					this.removeFormatTags
    				);
    				const range = document.createRange();
    				range.selectNodeContents(refs.editor);
    				selection.removeAllRanges();
    				selection.addRange(range);
    			}
    			exec("removeFormat");
    			selection.removeAllRanges();
    		}
    	}
    };

    const showColorPicker = function(cmd) {
    	const refs = get_store_value(this.references);
    	saveRange(refs.editor);
    	console.log(refs.colorPicker);
    	refs.colorPicker.$set({show: true, event: cmd});
    	if (!get_store_value(this.helper)[cmd]) {
    		this.helper.update(state => {
    			state[cmd] = true;
    			return state;
    		});
    		refs.colorPicker.$on(cmd, event => {
    			let item = event.detail;
    			if (item.modal) {
    				this.modal.$set({
    					show: true,
    					event: "colorHref",
    					title: "Text color",
    					label:
    						cmd === "foreColor" ? "Text color" : "Background color"
    				});
    				const command = cmd;
    				if (!get_store_value(this.helper)[`${command}Modal`]) {
    					get_store_value(this.helper)[`${command}Modal`] = true;
    					this.modal.$on("colorHref", event => {
    						let color = event.detail;
    						restoreRange(refs.editor);
    						exec(command, color);
    					});
    				}
    			} else {
    				restoreRange(refs.editor);
    				exec(cmd, item.color);
    			}
    		});
    	}
    };

    /* node_modules\cl-editor\src\helpers\EditorModal.svelte generated by Svelte v3.31.0 */

    const { console: console_1$2 } = globals;
    const file$d = "node_modules\\cl-editor\\src\\helpers\\EditorModal.svelte";

    // (12:24) {#if error}
    function create_if_block$5(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Required";
    			attr_dev(span, "class", "msg-error svelte-1nq4m5m");
    			add_location(span, file$d, 12, 24, 684);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(12:24) {#if error}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div2;
    	let div1;
    	let span0;
    	let t1;
    	let t2;
    	let form;
    	let label_1;
    	let input;
    	let t3;
    	let span2;
    	let span1;
    	let t4;
    	let t5;
    	let t6;
    	let button0;
    	let t8;
    	let button1;
    	let mounted;
    	let dispose;
    	let if_block = /*error*/ ctx[2] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			span0 = element("span");
    			t1 = text(/*title*/ ctx[3]);
    			t2 = space();
    			form = element("form");
    			label_1 = element("label");
    			input = element("input");
    			t3 = space();
    			span2 = element("span");
    			span1 = element("span");
    			t4 = text(/*label*/ ctx[4]);
    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			button0 = element("button");
    			button0.textContent = "Confirm";
    			t8 = space();
    			button1 = element("button");
    			button1.textContent = "Cancel";
    			attr_dev(div0, "class", "cl-editor-overlay svelte-1nq4m5m");
    			add_location(div0, file$d, 2, 4, 104);
    			attr_dev(span0, "class", "modal-title svelte-1nq4m5m");
    			add_location(span0, file$d, 5, 12, 240);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", "text");
    			attr_dev(input, "class", "svelte-1nq4m5m");
    			add_location(input, file$d, 8, 20, 436);
    			attr_dev(span1, "class", "svelte-1nq4m5m");
    			add_location(span1, file$d, 10, 24, 603);
    			attr_dev(span2, "class", "input-info svelte-1nq4m5m");
    			add_location(span2, file$d, 9, 20, 553);
    			attr_dev(label_1, "class", "modal-label svelte-1nq4m5m");
    			toggle_class(label_1, "input-error", /*error*/ ctx[2]);
    			add_location(label_1, file$d, 7, 16, 362);
    			attr_dev(button0, "class", "modal-button modal-submit svelte-1nq4m5m");
    			attr_dev(button0, "type", "submit");
    			add_location(button0, file$d, 16, 16, 823);
    			attr_dev(button1, "class", "modal-button modal-reset svelte-1nq4m5m");
    			attr_dev(button1, "type", "reset");
    			add_location(button1, file$d, 17, 16, 912);
    			add_location(form, file$d, 6, 12, 293);
    			attr_dev(div1, "class", "modal-box svelte-1nq4m5m");
    			add_location(div1, file$d, 4, 8, 204);
    			attr_dev(div2, "class", "cl-editor-modal svelte-1nq4m5m");
    			add_location(div2, file$d, 3, 4, 166);
    			set_style(div3, "display", /*show*/ ctx[0] ? "block" : "none");
    			add_location(div3, file$d, 1, 0, 51);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, span0);
    			append_dev(span0, t1);
    			append_dev(div1, t2);
    			append_dev(div1, form);
    			append_dev(form, label_1);
    			append_dev(label_1, input);
    			/*input_binding*/ ctx[10](input);
    			set_input_value(input, /*text*/ ctx[1]);
    			append_dev(label_1, t3);
    			append_dev(label_1, span2);
    			append_dev(span2, span1);
    			append_dev(span1, t4);
    			append_dev(span2, t5);
    			if (if_block) if_block.m(span2, null);
    			append_dev(form, t6);
    			append_dev(form, button0);
    			append_dev(form, t8);
    			append_dev(form, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*cancel*/ ctx[7], false, false, false),
    					listen_dev(input, "keyup", /*hideError*/ ctx[8], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[11]),
    					listen_dev(button1, "click", /*cancel*/ ctx[7], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[12]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 8) set_data_dev(t1, /*title*/ ctx[3]);

    			if (dirty & /*text*/ 2 && input.value !== /*text*/ ctx[1]) {
    				set_input_value(input, /*text*/ ctx[1]);
    			}

    			if (dirty & /*label*/ 16) set_data_dev(t4, /*label*/ ctx[4]);

    			if (/*error*/ ctx[2]) {
    				if (if_block) ; else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(span2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*error*/ 4) {
    				toggle_class(label_1, "input-error", /*error*/ ctx[2]);
    			}

    			if (dirty & /*show*/ 1) {
    				set_style(div3, "display", /*show*/ ctx[0] ? "block" : "none");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			/*input_binding*/ ctx[10](null);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("EditorModal", slots, []);
    	let dispatcher = new createEventDispatcher();
    	let { show = false } = $$props;
    	let { text = "" } = $$props;
    	let { event = "" } = $$props;
    	let { title = "" } = $$props;
    	let { label = "" } = $$props;
    	let { error = false } = $$props;
    	let refs = {};

    	function confirm() {
    		if (text) {
    			console.log("dispatcher", text, event);
    			dispatcher(event, text);
    			cancel();
    		} else {
    			$$invalidate(2, error = true);
    			refs.text.focus();
    		}
    	}

    	function cancel() {
    		$$invalidate(0, show = false);
    		$$invalidate(1, text = "");
    		$$invalidate(2, error = false);
    	}

    	function hideError() {
    		$$invalidate(2, error = false);
    	}

    	const writable_props = ["show", "text", "event", "title", "label", "error"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<EditorModal> was created with unknown prop '${key}'`);
    	});

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			refs.text = $$value;
    			$$invalidate(5, refs);
    		});
    	}

    	function input_input_handler() {
    		text = this.value;
    		$$invalidate(1, text);
    	}

    	const submit_handler = event => confirm();

    	$$self.$$set = $$props => {
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("event" in $$props) $$invalidate(9, event = $$props.event);
    		if ("title" in $$props) $$invalidate(3, title = $$props.title);
    		if ("label" in $$props) $$invalidate(4, label = $$props.label);
    		if ("error" in $$props) $$invalidate(2, error = $$props.error);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		dispatcher,
    		show,
    		text,
    		event,
    		title,
    		label,
    		error,
    		refs,
    		confirm,
    		cancel,
    		hideError
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatcher" in $$props) dispatcher = $$props.dispatcher;
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("event" in $$props) $$invalidate(9, event = $$props.event);
    		if ("title" in $$props) $$invalidate(3, title = $$props.title);
    		if ("label" in $$props) $$invalidate(4, label = $$props.label);
    		if ("error" in $$props) $$invalidate(2, error = $$props.error);
    		if ("refs" in $$props) $$invalidate(5, refs = $$props.refs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*show, refs*/ 33) {
    			 {
    				if (show) {
    					setTimeout(() => {
    						refs.text.focus();
    					});
    				}
    			}
    		}
    	};

    	return [
    		show,
    		text,
    		error,
    		title,
    		label,
    		refs,
    		confirm,
    		cancel,
    		hideError,
    		event,
    		input_binding,
    		input_input_handler,
    		submit_handler
    	];
    }

    class EditorModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			show: 0,
    			text: 1,
    			event: 9,
    			title: 3,
    			label: 4,
    			error: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorModal",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get show() {
    		return this.$$.ctx[0];
    	}

    	set show(show) {
    		this.$set({ show });
    		flush();
    	}

    	get text() {
    		return this.$$.ctx[1];
    	}

    	set text(text) {
    		this.$set({ text });
    		flush();
    	}

    	get event() {
    		return this.$$.ctx[9];
    	}

    	set event(event) {
    		this.$set({ event });
    		flush();
    	}

    	get title() {
    		return this.$$.ctx[3];
    	}

    	set title(title) {
    		this.$set({ title });
    		flush();
    	}

    	get label() {
    		return this.$$.ctx[4];
    	}

    	set label(label) {
    		this.$set({ label });
    		flush();
    	}

    	get error() {
    		return this.$$.ctx[2];
    	}

    	set error(error) {
    		this.$set({ error });
    		flush();
    	}
    }

    /* node_modules\cl-editor\src\helpers\EditorColorPicker.svelte generated by Svelte v3.31.0 */
    const file$e = "node_modules\\cl-editor\\src\\helpers\\EditorColorPicker.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (4:8) {#each btns as btn}
    function create_each_block$3(ctx) {
    	let button;
    	let t_value = (/*btn*/ ctx[9].text || "") + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[5](/*btn*/ ctx[9], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "color-picker-btn svelte-njq4pk");
    			set_style(button, "background-color", /*btn*/ ctx[9].color);
    			add_location(button, file$e, 4, 8, 188);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*btns*/ 2 && t_value !== (t_value = (/*btn*/ ctx[9].text || "") + "")) set_data_dev(t, t_value);

    			if (dirty & /*btns*/ 2) {
    				set_style(button, "background-color", /*btn*/ ctx[9].color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(4:8) {#each btns as btn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let mounted;
    	let dispose;
    	let each_value = /*btns*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "color-picker-overlay svelte-njq4pk");
    			add_location(div0, file$e, 1, 4, 53);
    			attr_dev(div1, "class", "color-picker-wrapper svelte-njq4pk");
    			add_location(div1, file$e, 2, 4, 117);
    			set_style(div2, "display", /*show*/ ctx[0] ? "block" : "none");
    			add_location(div2, file$e, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*close*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*btns, selectColor*/ 10) {
    				each_value = /*btns*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*show*/ 1) {
    				set_style(div2, "display", /*show*/ ctx[0] ? "block" : "none");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("EditorColorPicker", slots, []);
    	let dispatcher = new createEventDispatcher();

    	const colors = [
    		"ffffff",
    		"000000",
    		"eeece1",
    		"1f497d",
    		"4f81bd",
    		"c0504d",
    		"9bbb59",
    		"8064a2",
    		"4bacc6",
    		"f79646",
    		"ffff00",
    		"f2f2f2",
    		"7f7f7f",
    		"ddd9c3",
    		"c6d9f0",
    		"dbe5f1",
    		"f2dcdb",
    		"ebf1dd",
    		"e5e0ec",
    		"dbeef3",
    		"fdeada",
    		"fff2ca",
    		"d8d8d8",
    		"595959",
    		"c4bd97",
    		"8db3e2",
    		"b8cce4",
    		"e5b9b7",
    		"d7e3bc",
    		"ccc1d9",
    		"b7dde8",
    		"fbd5b5",
    		"ffe694",
    		"bfbfbf",
    		"3f3f3f",
    		"938953",
    		"548dd4",
    		"95b3d7",
    		"d99694",
    		"c3d69b",
    		"b2a2c7",
    		"b7dde8",
    		"fac08f",
    		"f2c314",
    		"a5a5a5",
    		"262626",
    		"494429",
    		"17365d",
    		"366092",
    		"953734",
    		"76923c",
    		"5f497a",
    		"92cddc",
    		"e36c09",
    		"c09100",
    		"7f7f7f",
    		"0c0c0c",
    		"1d1b10",
    		"0f243e",
    		"244061",
    		"632423",
    		"4f6128",
    		"3f3151",
    		"31859b",
    		"974806",
    		"7f6000"
    	];

    	const getBtns = () => {
    		const btns = colors.map(color => ({ color: `#${color}` }));
    		btns.push({ text: "#", modal: true });
    		return btns;
    	};

    	let { show = false } = $$props;
    	let { btns = [] } = $$props;
    	let { event = "" } = $$props;

    	onMount(() => {
    		$$invalidate(1, btns = getBtns());
    	});

    	function close() {
    		$$invalidate(0, show = false);
    	}

    	function selectColor(btn) {
    		dispatcher(event, btn);
    		close();
    	}

    	const writable_props = ["show", "btns", "event"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EditorColorPicker> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (btn, event) => selectColor(btn);

    	$$self.$$set = $$props => {
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    		if ("btns" in $$props) $$invalidate(1, btns = $$props.btns);
    		if ("event" in $$props) $$invalidate(4, event = $$props.event);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		dispatcher,
    		colors,
    		getBtns,
    		show,
    		btns,
    		event,
    		close,
    		selectColor
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatcher" in $$props) dispatcher = $$props.dispatcher;
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    		if ("btns" in $$props) $$invalidate(1, btns = $$props.btns);
    		if ("event" in $$props) $$invalidate(4, event = $$props.event);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [show, btns, close, selectColor, event, click_handler];
    }

    class EditorColorPicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { show: 0, btns: 1, event: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditorColorPicker",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get show() {
    		throw new Error("<EditorColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<EditorColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get btns() {
    		throw new Error("<EditorColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set btns(value) {
    		throw new Error("<EditorColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get event() {
    		throw new Error("<EditorColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set event(value) {
    		throw new Error("<EditorColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const state = (function(name ){

        let state = {
            actionBtns: [],
            actionObj: {}
        };

        const { subscribe, set, update } = writable(state);

        return {
            name,
            set,
            update,
            subscribe
        }
    });

    const createStateStore = state;

    /* node_modules\cl-editor\src\Editor.svelte generated by Svelte v3.31.0 */

    const { Object: Object_1 } = globals;
    const file$f = "node_modules\\cl-editor\\src\\Editor.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	return child_ctx;
    }

    // (8:4) {#each $state.actionBtns as action}
    function create_each_block$4(ctx) {
    	let button;
    	let html_tag;
    	let raw_value = /*action*/ ctx[36].icon + "";
    	let t;
    	let button_class_value;
    	let button_title_value;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[22](/*action*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = space();
    			html_tag = new HtmlTag(t);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", button_class_value = "cl-button " + (/*action*/ ctx[36].active ? "active" : "") + " svelte-1a534py");
    			attr_dev(button, "title", button_title_value = /*action*/ ctx[36].title);
    			button.disabled = button_disabled_value = /*action*/ ctx[36].disabled;
    			add_location(button, file$f, 8, 6, 302);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			html_tag.m(raw_value, button);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*$state*/ 2 && raw_value !== (raw_value = /*action*/ ctx[36].icon + "")) html_tag.p(raw_value);

    			if (dirty[0] & /*$state*/ 2 && button_class_value !== (button_class_value = "cl-button " + (/*action*/ ctx[36].active ? "active" : "") + " svelte-1a534py")) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty[0] & /*$state*/ 2 && button_title_value !== (button_title_value = /*action*/ ctx[36].title)) {
    				attr_dev(button, "title", button_title_value);
    			}

    			if (dirty[0] & /*$state*/ 2 && button_disabled_value !== (button_disabled_value = /*action*/ ctx[36].disabled)) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(8:4) {#each $state.actionBtns as action}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let textarea;
    	let t2;
    	let editormodal;
    	let t3;
    	let editorcolorpicker;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*$state*/ ctx[1].actionBtns;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	let editormodal_props = {};
    	editormodal = new EditorModal({ props: editormodal_props, $$inline: true });
    	/*editormodal_binding*/ ctx[29](editormodal);
    	let editorcolorpicker_props = {};

    	editorcolorpicker = new EditorColorPicker({
    			props: editorcolorpicker_props,
    			$$inline: true
    		});

    	/*editorcolorpicker_binding*/ ctx[30](editorcolorpicker);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			textarea = element("textarea");
    			t2 = space();
    			create_component(editormodal.$$.fragment);
    			t3 = space();
    			create_component(editorcolorpicker.$$.fragment);
    			attr_dev(div0, "class", "cl-actionbar svelte-1a534py");
    			add_location(div0, file$f, 6, 2, 229);
    			attr_dev(div1, "class", "cl-content svelte-1a534py");
    			set_style(div1, "height", /*height*/ ctx[0]);
    			attr_dev(div1, "contenteditable", "true");
    			add_location(div1, file$f, 17, 2, 568);
    			attr_dev(textarea, "class", "cl-textarea svelte-1a534py");
    			set_style(textarea, "max-height", /*height*/ ctx[0]);
    			set_style(textarea, "min-height", /*height*/ ctx[0]);
    			add_location(textarea, file$f, 27, 2, 890);
    			attr_dev(div2, "class", "cl svelte-1a534py");
    			add_location(div2, file$f, 5, 0, 172);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			/*div1_binding*/ ctx[23](div1);
    			append_dev(div2, t1);
    			append_dev(div2, textarea);
    			/*textarea_binding*/ ctx[28](textarea);
    			append_dev(div2, t2);
    			mount_component(editormodal, div2, null);
    			append_dev(div2, t3);
    			mount_component(editorcolorpicker, div2, null);
    			/*div2_binding*/ ctx[31](div2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "click", /*click_handler*/ ctx[21], false, false, false),
    					listen_dev(div1, "input", /*input_handler*/ ctx[24], false, false, false),
    					listen_dev(div1, "mouseup", /*mouseup_handler*/ ctx[25], false, false, false),
    					listen_dev(div1, "keyup", /*keyup_handler*/ ctx[26], false, false, false),
    					listen_dev(div1, "paste", /*paste_handler*/ ctx[27], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$state, _btnClicked*/ 66) {
    				each_value = /*$state*/ ctx[1].actionBtns;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty[0] & /*height*/ 1) {
    				set_style(div1, "height", /*height*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*height*/ 1) {
    				set_style(textarea, "max-height", /*height*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*height*/ 1) {
    				set_style(textarea, "min-height", /*height*/ ctx[0]);
    			}

    			const editormodal_changes = {};
    			editormodal.$set(editormodal_changes);
    			const editorcolorpicker_changes = {};
    			editorcolorpicker.$set(editorcolorpicker_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editormodal.$$.fragment, local);
    			transition_in(editorcolorpicker.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editormodal.$$.fragment, local);
    			transition_out(editorcolorpicker.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			/*div1_binding*/ ctx[23](null);
    			/*textarea_binding*/ ctx[28](null);
    			/*editormodal_binding*/ ctx[29](null);
    			destroy_component(editormodal);
    			/*editorcolorpicker_binding*/ ctx[30](null);
    			destroy_component(editorcolorpicker);
    			/*div2_binding*/ ctx[31](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const editors = [];

    function instance$f($$self, $$props, $$invalidate) {
    	let $state;
    	let $references;
    	let $helper;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Editor", slots, []);
    	let dispatcher = new createEventDispatcher();
    	let { actions = [] } = $$props;
    	let { height = "300px" } = $$props;
    	let { html = "" } = $$props;
    	let { removeFormatTags = ["h1", "h2", "blockquote"] } = $$props;

    	let helper = writable({
    		foreColor: false,
    		backColor: false,
    		foreColorModal: false,
    		backColorModal: false,
    		image: false,
    		link: false,
    		showEditor: true,
    		blurActive: false
    	});

    	validate_store(helper, "helper");
    	component_subscribe($$self, helper, value => $$invalidate(32, $helper = value));
    	editors.push({});
    	let contextKey = "editor_" + editors.length;
    	let state = createStateStore(contextKey);
    	validate_store(state, "state");
    	component_subscribe($$self, state, value => $$invalidate(1, $state = value));
    	let references = writable({});
    	validate_store(references, "references");
    	component_subscribe($$self, references, value => $$invalidate(2, $references = value));
    	set_store_value(state, $state.actionObj = getNewActionObj(defaultActions, actions), $state);

    	let context = {
    		exec: exec$1,
    		getHtml,
    		getText,
    		setHtml,
    		saveRange: saveRange$1,
    		restoreRange: restoreRange$1,
    		helper,
    		references,
    		state,
    		removeFormatTags
    	};

    	setContext(contextKey, context);

    	onMount(() => {
    		set_store_value(state, $state.actionBtns = getActionBtns($state.actionObj), $state);
    		setHtml(html);
    	});

    	function _btnClicked(action) {
    		$references.editor.focus();
    		saveRange$1($references.editor);
    		restoreRange$1($references.editor);
    		action.result.call(context);
    		_handleButtonStatus();
    	}

    	function _handleButtonStatus(clearBtns) {
    		const tags = clearBtns
    		? []
    		: getTagsRecursive(document.getSelection().focusNode);

    		Object.keys($state.actionObj).forEach(action => set_store_value(state, $state.actionObj[action].active = false, $state));
    		tags.forEach(tag => ($state.actionObj[tag.toLowerCase()] || {}).active = true);
    		set_store_value(state, $state.actionBtns = getActionBtns($state.actionObj), $state);
    		state.set($state);
    	}

    	function _onPaste(event) {
    		event.preventDefault();

    		exec$1("insertHTML", event.clipboardData.getData("text/html")
    		? cleanHtml(event.clipboardData.getData("text/html"))
    		: event.clipboardData.getData("text"));
    	}

    	function _onChange(event) {
    		dispatcher("change", event);
    	}

    	function _documentClick(event) {
    		if (!isEditorClick(event.target, $references.editorWrapper) && $helper.blurActive) {
    			dispatcher("blur", event);
    		}

    		set_store_value(helper, $helper.blurActive = true, $helper);
    	}

    	function exec$1(cmd, value) {
    		exec(cmd, value);
    	}

    	

    	function getHtml(sanitize) {
    		return sanitize
    		? removeBadTags($references.editor.innerHTML)
    		: $references.editor.innerHTML;
    	}

    	function getText() {
    		return $references.editor.innerText;
    	}

    	function setHtml(html, sanitize) {
    		set_store_value(references, $references.editor.innerHTML = sanitize ? removeBadTags(html) : html || "", $references);
    	}

    	function saveRange$1() {
    		saveRange($references.editor);
    	}

    	function restoreRange$1() {
    		restoreRange($references.editor);
    	}

    	const refs = $references;
    	const writable_props = ["actions", "height", "html", "removeFormatTags"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Editor> was created with unknown prop '${key}'`);
    	});

    	const click_handler = event => _documentClick(event);
    	const click_handler_1 = (action, event) => _btnClicked(action);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$references.editor = $$value;
    			references.set($references);
    		});
    	}

    	const input_handler = event => _onChange(event.target.innerHTML);
    	const mouseup_handler = () => _handleButtonStatus();
    	const keyup_handler = () => _handleButtonStatus();
    	const paste_handler = event => _onPaste(event);

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$references.raw = $$value;
    			references.set($references);
    		});
    	}

    	function editormodal_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$references.modal = $$value;
    			references.set($references);
    		});
    	}

    	function editorcolorpicker_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$references.colorPicker = $$value;
    			references.set($references);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$references.editorWrapper = $$value;
    			references.set($references);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("actions" in $$props) $$invalidate(11, actions = $$props.actions);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("html" in $$props) $$invalidate(12, html = $$props.html);
    		if ("removeFormatTags" in $$props) $$invalidate(13, removeFormatTags = $$props.removeFormatTags);
    	};

    	$$self.$capture_state = () => ({
    		editors,
    		getTagsRecursive,
    		_saveRange: saveRange,
    		_restoreRange: restoreRange,
    		_exec: exec,
    		cleanHtml,
    		getActionBtns,
    		getNewActionObj,
    		removeBadTags,
    		isEditorClick,
    		defaultActions,
    		EditorModal,
    		EditorColorPicker,
    		onMount,
    		createEventDispatcher,
    		setContext,
    		getContext,
    		createStateStore,
    		writable,
    		dispatcher,
    		actions,
    		height,
    		html,
    		removeFormatTags,
    		helper,
    		contextKey,
    		state,
    		references,
    		context,
    		_btnClicked,
    		_handleButtonStatus,
    		_onPaste,
    		_onChange,
    		_documentClick,
    		exec: exec$1,
    		getHtml,
    		getText,
    		setHtml,
    		saveRange: saveRange$1,
    		restoreRange: restoreRange$1,
    		refs,
    		$state,
    		$references,
    		$helper
    	});

    	$$self.$inject_state = $$props => {
    		if ("dispatcher" in $$props) dispatcher = $$props.dispatcher;
    		if ("actions" in $$props) $$invalidate(11, actions = $$props.actions);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("html" in $$props) $$invalidate(12, html = $$props.html);
    		if ("removeFormatTags" in $$props) $$invalidate(13, removeFormatTags = $$props.removeFormatTags);
    		if ("helper" in $$props) $$invalidate(3, helper = $$props.helper);
    		if ("contextKey" in $$props) contextKey = $$props.contextKey;
    		if ("state" in $$props) $$invalidate(4, state = $$props.state);
    		if ("references" in $$props) $$invalidate(5, references = $$props.references);
    		if ("context" in $$props) context = $$props.context;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		height,
    		$state,
    		$references,
    		helper,
    		state,
    		references,
    		_btnClicked,
    		_handleButtonStatus,
    		_onPaste,
    		_onChange,
    		_documentClick,
    		actions,
    		html,
    		removeFormatTags,
    		exec$1,
    		getHtml,
    		getText,
    		setHtml,
    		saveRange$1,
    		restoreRange$1,
    		refs,
    		click_handler,
    		click_handler_1,
    		div1_binding,
    		input_handler,
    		mouseup_handler,
    		keyup_handler,
    		paste_handler,
    		textarea_binding,
    		editormodal_binding,
    		editorcolorpicker_binding,
    		div2_binding
    	];
    }

    class Editor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$f,
    			create_fragment$f,
    			safe_not_equal,
    			{
    				actions: 11,
    				height: 0,
    				html: 12,
    				removeFormatTags: 13,
    				exec: 14,
    				getHtml: 15,
    				getText: 16,
    				setHtml: 17,
    				saveRange: 18,
    				restoreRange: 19,
    				refs: 20
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Editor",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get actions() {
    		return this.$$.ctx[11];
    	}

    	set actions(actions) {
    		this.$set({ actions });
    		flush();
    	}

    	get height() {
    		return this.$$.ctx[0];
    	}

    	set height(height) {
    		this.$set({ height });
    		flush();
    	}

    	get html() {
    		return this.$$.ctx[12];
    	}

    	set html(html) {
    		this.$set({ html });
    		flush();
    	}

    	get removeFormatTags() {
    		return this.$$.ctx[13];
    	}

    	set removeFormatTags(removeFormatTags) {
    		this.$set({ removeFormatTags });
    		flush();
    	}

    	get exec() {
    		return this.$$.ctx[14];
    	}

    	set exec(value) {
    		throw new Error("<Editor>: Cannot set read-only property 'exec'");
    	}

    	get getHtml() {
    		return this.$$.ctx[15];
    	}

    	set getHtml(value) {
    		throw new Error("<Editor>: Cannot set read-only property 'getHtml'");
    	}

    	get getText() {
    		return this.$$.ctx[16];
    	}

    	set getText(value) {
    		throw new Error("<Editor>: Cannot set read-only property 'getText'");
    	}

    	get setHtml() {
    		return this.$$.ctx[17];
    	}

    	set setHtml(value) {
    		throw new Error("<Editor>: Cannot set read-only property 'setHtml'");
    	}

    	get saveRange() {
    		return this.$$.ctx[18];
    	}

    	set saveRange(value) {
    		throw new Error("<Editor>: Cannot set read-only property 'saveRange'");
    	}

    	get restoreRange() {
    		return this.$$.ctx[19];
    	}

    	set restoreRange(value) {
    		throw new Error("<Editor>: Cannot set read-only property 'restoreRange'");
    	}

    	get refs() {
    		return this.$$.ctx[20];
    	}

    	set refs(value) {
    		throw new Error("<Editor>: Cannot set read-only property 'refs'");
    	}
    }

    /* templates\components\gallery\GalleryDescription.svelte generated by Svelte v3.31.0 */
    const file$g = "templates\\components\\gallery\\GalleryDescription.svelte";

    // (88:4) {:else}
    function create_else_block(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "description");
    			add_location(div, file$g, 88, 8, 2342);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = /*descHtml*/ ctx[3];

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*activate*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*descHtml*/ 8) div.innerHTML = /*descHtml*/ ctx[3];		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(88:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (80:4) {#if active}
    function create_if_block$6(ctx) {
    	let div;
    	let editor_1;
    	let current;

    	let editor_1_props = {
    		actions: /*actions*/ ctx[5],
    		height: "100%",
    		html: /*imgData*/ ctx[0].description
    	};

    	editor_1 = new Editor({ props: editor_1_props, $$inline: true });
    	/*editor_1_binding*/ ctx[9](editor_1);
    	editor_1.$on("blur", /*deactivate*/ ctx[7]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editor_1.$$.fragment);
    			attr_dev(div, "class", "editor-wrapper svelte-16unyda");
    			add_location(div, file$g, 80, 8, 2089);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editor_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const editor_1_changes = {};
    			if (dirty & /*imgData*/ 1) editor_1_changes.html = /*imgData*/ ctx[0].description;
    			editor_1.$set(editor_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editor_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editor_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*editor_1_binding*/ ctx[9](null);
    			destroy_component(editor_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(80:4) {#if active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let div_class_value;
    	let current;
    	const if_block_creators = [create_if_block$6, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*active*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*blockClass*/ ctx[4]) + " svelte-16unyda"));
    			add_location(div, file$g, 78, 1, 2037);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			if (!current || dirty & /*blockClass*/ 16 && div_class_value !== (div_class_value = "" + (null_to_empty(/*blockClass*/ ctx[4]) + " svelte-16unyda"))) {
    				attr_dev(div, "class", div_class_value);
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
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GalleryDescription", slots, []);
    	let { updateDescription = () => false } = $$props;
    	let { imgData = {} } = $$props;
    	let active = false;
    	let editor;
    	const actions = ["viewHtml", "b", "i", "u", "a"];

    	const updateDesc = htmlString => {
    		updateDescription(imgData.fileName, imgData.title, htmlString);
    	};

    	const updateTitle = title => {
    		updateDescription(imgData.fileName, title, imgData.description);
    	};

    	const activate = () => {
    		$$invalidate(1, active = true);
    	};

    	const deactivate = () => {
    		updateDesc(editor.getHtml());
    		$$invalidate(1, active = false);
    	};

    	const writable_props = ["updateDescription", "imgData"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GalleryDescription> was created with unknown prop '${key}'`);
    	});

    	function editor_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			editor = $$value;
    			$$invalidate(2, editor);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("updateDescription" in $$props) $$invalidate(8, updateDescription = $$props.updateDescription);
    		if ("imgData" in $$props) $$invalidate(0, imgData = $$props.imgData);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Editor,
    		updateDescription,
    		imgData,
    		active,
    		editor,
    		actions,
    		updateDesc,
    		updateTitle,
    		activate,
    		deactivate,
    		descHtml,
    		blockClass
    	});

    	$$self.$inject_state = $$props => {
    		if ("updateDescription" in $$props) $$invalidate(8, updateDescription = $$props.updateDescription);
    		if ("imgData" in $$props) $$invalidate(0, imgData = $$props.imgData);
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    		if ("editor" in $$props) $$invalidate(2, editor = $$props.editor);
    		if ("descHtml" in $$props) $$invalidate(3, descHtml = $$props.descHtml);
    		if ("blockClass" in $$props) $$invalidate(4, blockClass = $$props.blockClass);
    	};

    	let descHtml;
    	let blockClass;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*imgData*/ 1) {
    			 $$invalidate(3, descHtml = imgData.description || "<em>Click to edit...</em>");
    		}

    		if ($$self.$$.dirty & /*active*/ 2) {
    			 $$invalidate(4, blockClass = "description-block" + (active ? " active" : ""));
    		}
    	};

    	return [
    		imgData,
    		active,
    		editor,
    		descHtml,
    		blockClass,
    		actions,
    		activate,
    		deactivate,
    		updateDescription,
    		editor_1_binding
    	];
    }

    class GalleryDescription extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { updateDescription: 8, imgData: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GalleryDescription",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get updateDescription() {
    		throw new Error("<GalleryDescription>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set updateDescription(value) {
    		throw new Error("<GalleryDescription>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imgData() {
    		throw new Error("<GalleryDescription>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgData(value) {
    		throw new Error("<GalleryDescription>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* templates\components\gallery\GalleryItem.svelte generated by Svelte v3.31.0 */
    const file$h = "templates\\components\\gallery\\GalleryItem.svelte";

    // (19:4) <Intersector once={true} let:intersecting={intersecting}>
    function create_default_slot$1(ctx) {
    	let galleryimage;
    	let current;

    	galleryimage = new GalleryImage({
    			props: {
    				viewLightbox: /*viewLightbox*/ ctx[2],
    				imgData: /*imgData*/ ctx[0],
    				show: /*intersecting*/ ctx[5]
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
    			if (dirty & /*viewLightbox*/ 4) galleryimage_changes.viewLightbox = /*viewLightbox*/ ctx[2];
    			if (dirty & /*imgData*/ 1) galleryimage_changes.imgData = /*imgData*/ ctx[0];
    			if (dirty & /*intersecting*/ 32) galleryimage_changes.show = /*intersecting*/ ctx[5];
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
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(19:4) <Intersector once={true} let:intersecting={intersecting}>",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#if mode !== 'arrange'}
    function create_if_block$7(ctx) {
    	let gallerydescription;
    	let current;

    	gallerydescription = new GalleryDescription({
    			props: {
    				imgData: /*imgData*/ ctx[0],
    				updateDescription: /*updateDescription*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gallerydescription.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gallerydescription, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gallerydescription_changes = {};
    			if (dirty & /*imgData*/ 1) gallerydescription_changes.imgData = /*imgData*/ ctx[0];
    			if (dirty & /*updateDescription*/ 8) gallerydescription_changes.updateDescription = /*updateDescription*/ ctx[3];
    			gallerydescription.$set(gallerydescription_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gallerydescription.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gallerydescription.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gallerydescription, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(22:4) {#if mode !== 'arrange'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div;
    	let intersector;
    	let t;
    	let div_class_value;
    	let current;

    	intersector = new Intersector({
    			props: {
    				once: true,
    				$$slots: {
    					default: [
    						create_default_slot$1,
    						({ intersecting }) => ({ 5: intersecting }),
    						({ intersecting }) => intersecting ? 32 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = /*mode*/ ctx[1] !== "arrange" && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(intersector.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*frameClass*/ ctx[4]) + " svelte-1pr21hm"));
    			add_location(div, file$h, 17, 0, 538);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(intersector, div, null);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const intersector_changes = {};

    			if (dirty & /*$$scope, viewLightbox, imgData, intersecting*/ 101) {
    				intersector_changes.$$scope = { dirty, ctx };
    			}

    			intersector.$set(intersector_changes);

    			if (/*mode*/ ctx[1] !== "arrange") {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*mode*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*frameClass*/ 16 && div_class_value !== (div_class_value = "" + (null_to_empty(/*frameClass*/ ctx[4]) + " svelte-1pr21hm"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(intersector.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(intersector.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(intersector);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GalleryItem", slots, []);
    	let { imgData } = $$props;
    	let { mode } = $$props;
    	let { viewLightbox = () => false } = $$props;
    	let { updateDescription = () => false } = $$props;
    	const writable_props = ["imgData", "mode", "viewLightbox", "updateDescription"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GalleryItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("imgData" in $$props) $$invalidate(0, imgData = $$props.imgData);
    		if ("mode" in $$props) $$invalidate(1, mode = $$props.mode);
    		if ("viewLightbox" in $$props) $$invalidate(2, viewLightbox = $$props.viewLightbox);
    		if ("updateDescription" in $$props) $$invalidate(3, updateDescription = $$props.updateDescription);
    	};

    	$$self.$capture_state = () => ({
    		Intersector,
    		GalleryImage,
    		GalleryDescription,
    		imgData,
    		mode,
    		viewLightbox,
    		updateDescription,
    		frameClass
    	});

    	$$self.$inject_state = $$props => {
    		if ("imgData" in $$props) $$invalidate(0, imgData = $$props.imgData);
    		if ("mode" in $$props) $$invalidate(1, mode = $$props.mode);
    		if ("viewLightbox" in $$props) $$invalidate(2, viewLightbox = $$props.viewLightbox);
    		if ("updateDescription" in $$props) $$invalidate(3, updateDescription = $$props.updateDescription);
    		if ("frameClass" in $$props) $$invalidate(4, frameClass = $$props.frameClass);
    	};

    	let frameClass;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*mode*/ 2) {
    			// console.log('imgData', imgData);
    			 $$invalidate(4, frameClass = "photo-frame" + " " + mode);
    		}
    	};

    	return [imgData, mode, viewLightbox, updateDescription, frameClass];
    }

    class GalleryItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			imgData: 0,
    			mode: 1,
    			viewLightbox: 2,
    			updateDescription: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GalleryItem",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*imgData*/ ctx[0] === undefined && !("imgData" in props)) {
    			console.warn("<GalleryItem> was created without expected prop 'imgData'");
    		}

    		if (/*mode*/ ctx[1] === undefined && !("mode" in props)) {
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

    	get updateDescription() {
    		throw new Error("<GalleryItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set updateDescription(value) {
    		throw new Error("<GalleryItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-icons\md\MdShuffle.svelte generated by Svelte v3.31.0 */
    const file$i = "node_modules\\svelte-icons\\md\\MdShuffle.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot$2(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z");
    			add_location(path, file$i, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MdShuffle", slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdShuffle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdShuffle",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* templates\components\columns\ColumnDragDrop.svelte generated by Svelte v3.31.0 */
    const file$j = "templates\\components\\columns\\ColumnDragDrop.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (83:12) {#if column.items && column.items.length}
    function create_if_block$8(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let dndzone_action;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*column*/ ctx[12].items;
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*imgData*/ ctx[15].fileName;
    	validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$1(key, child_ctx));
    	}

    	function consider_handler(...args) {
    		return /*consider_handler*/ ctx[7](/*column*/ ctx[12], ...args);
    	}

    	function finalize_handler(...args) {
    		return /*finalize_handler*/ ctx[8](/*column*/ ctx[12], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "gallery-list svelte-13s0f4c");
    			add_location(div, file$j, 83, 16, 2686);
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
    						items: /*column*/ ctx[12].items,
    						flipDurationMs,
    						dragDisabled: /*mode*/ ctx[0] !== "arrange"
    					})),
    					listen_dev(div, "consider", consider_handler, false, false, false),
    					listen_dev(div, "finalize", finalize_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*imageBatches, mode, GalleryStore*/ 3) {
    				const each_value_1 = /*column*/ ctx[12].items;
    				validate_each_argument(each_value_1);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, fix_and_outro_and_destroy_block, create_each_block_1$1, t, get_each_context_1$1);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}

    			if (dndzone_action && is_function(dndzone_action.update) && dirty & /*imageBatches, mode*/ 3) dndzone_action.update.call(null, {
    				items: /*column*/ ctx[12].items,
    				flipDurationMs,
    				dragDisabled: /*mode*/ ctx[0] !== "arrange"
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
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(83:12) {#if column.items && column.items.length}",
    		ctx
    	});

    	return block;
    }

    // (90:20) {#each column.items as imgData(imgData.fileName)}
    function create_each_block_1$1(key_1, ctx) {
    	let div;
    	let galleryitem;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	galleryitem = new GalleryItem({
    			props: {
    				imgData: /*imgData*/ ctx[15],
    				mode: /*mode*/ ctx[0],
    				updateDescription: GalleryStore.updateDescription,
    				viewLightbox: GalleryStore.viewLightbox
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
    			add_location(div, file$j, 90, 24, 3082);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(galleryitem, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const galleryitem_changes = {};
    			if (dirty & /*imageBatches*/ 2) galleryitem_changes.imgData = /*imgData*/ ctx[15];
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
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(90:20) {#each column.items as imgData(imgData.fileName)}",
    		ctx
    	});

    	return block;
    }

    // (82:8) {#each imageBatches as column(column.columnId)}
    function create_each_block$5(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = /*column*/ ctx[12].items && /*column*/ ctx[12].items.length && create_if_block$8(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*column*/ ctx[12].items && /*column*/ ctx[12].items.length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*imageBatches*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$8(ctx);
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
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(82:8) {#each imageBatches as column(column.columnId)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div0;
    	let mdshuffle;
    	let t;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	mdshuffle = new MdShuffle({ $$inline: true });
    	let each_value = /*imageBatches*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*column*/ ctx[12].columnId;
    	validate_each_keys(ctx, each_value, get_each_context$5, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$5(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(mdshuffle.$$.fragment);
    			t = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "arrange-toggle svelte-13s0f4c");
    			add_location(div0, file$j, 79, 0, 2459);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*boardClass*/ ctx[2]) + " svelte-13s0f4c"));
    			add_location(div1, file$j, 80, 0, 2532);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(mdshuffle, div0, null);
    			insert_dev(target, t, anchor);
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
    			if (dirty & /*imageBatches, flipDurationMs, mode, handleDndConsider, handleDndFinalize, GalleryStore*/ 27) {
    				const each_value = /*imageBatches*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$5, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block$5, null, get_each_context$5);
    				check_outros();
    			}

    			if (!current || dirty & /*boardClass*/ 4 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*boardClass*/ ctx[2]) + " svelte-13s0f4c"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdshuffle.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdshuffle.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(mdshuffle);
    			if (detaching) detach_dev(t);
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
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const flipDurationMs = 200;

    function instance$j($$self, $$props, $$invalidate) {
    	let $GalleryStore;
    	validate_store(GalleryStore, "GalleryStore");
    	component_subscribe($$self, GalleryStore, $$value => $$invalidate(6, $GalleryStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ColumnDragDrop", slots, []);
    	let mode = "single";

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

    		// console.log('columns', columns, '  columnSize', columnSize, '  Batch!', batch);
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
    		const index = imageBatches.findIndex(c => c.columnId === cId);
    		$$invalidate(1, imageBatches[index].items = e.detail.items, imageBatches);
    		$$invalidate(1, imageBatches = [...imageBatches]);
    	}

    	function handleDndFinalize(cId, e) {
    		const index = imageBatches.findIndex(c => c.columnId === cId);
    		$$invalidate(1, imageBatches[index].items = e.detail.items, imageBatches);
    		$$invalidate(1, imageBatches = [...imageBatches]);
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

    	const handleToggle = () => {
    		if (mode === "single") {
    			$$invalidate(0, mode = "arrange");
    		} else {
    			updateStore();
    			$$invalidate(0, mode = "single");
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ColumnDragDrop> was created with unknown prop '${key}'`);
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
    		MdShuffle,
    		flipDurationMs,
    		mode,
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
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColumnDragDrop",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* templates\Album.svelte generated by Svelte v3.31.0 */
    const file$k = "templates\\Album.svelte";

    function create_fragment$k(ctx) {
    	let main;
    	let controlpanel;
    	let t0;
    	let column;
    	let t1;
    	let lightbox;
    	let current;
    	controlpanel = new ControlPanel({ $$inline: true });
    	column = new ColumnDragDrop({ $$inline: true });
    	lightbox = new Lightbox({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(controlpanel.$$.fragment);
    			t0 = space();
    			create_component(column.$$.fragment);
    			t1 = space();
    			create_component(lightbox.$$.fragment);
    			attr_dev(main, "class", "svelte-1dv8tjo");
    			add_location(main, file$k, 6, 0, 231);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(controlpanel, main, null);
    			append_dev(main, t0);
    			mount_component(column, main, null);
    			append_dev(main, t1);
    			mount_component(lightbox, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(controlpanel.$$.fragment, local);
    			transition_in(column.$$.fragment, local);
    			transition_in(lightbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(controlpanel.$$.fragment, local);
    			transition_out(column.$$.fragment, local);
    			transition_out(lightbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(controlpanel);
    			destroy_component(column);
    			destroy_component(lightbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Album", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Album> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Lightbox, ControlPanel, Column: ColumnDragDrop });
    	return [];
    }

    class Album extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Album",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    const hydrateSharedData = galleryData => {
        window.NAV_DATA = window.NAV_DATA || {};
        window.NAV_DATA.currentURL =galleryData.url;
    };

    const StartApp = galleryData => {

        if (!galleryData) {
            console.error('GalleryData not found');
            return;
        }

        const title = (galleryData.title ? galleryData.title : '') +
            (galleryData.subtitle_A ? ' | ' + galleryData.subtitle_A : '');

        if (title) {
            document.title = title;
            const titleBar = document.querySelector('#headerBar .page-header-title');
            titleBar.innerHTML = title;
        }

        GalleryStore.set(galleryData);
        hydrateSharedData(galleryData);

        // eslint-disable-next-line no-unused-vars
        const app = new Album({
            target: document.getElementById('mainApp'),
            props: {}
        });

    };

    window.StartApp = StartApp;

}());
//# sourceMappingURL=album-app.js.map
