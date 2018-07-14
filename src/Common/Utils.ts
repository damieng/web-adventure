
interface Map<K, V> {
    getOrCreate(key: K, creator: (() => V)):V;
}

function GetOrCreate<K, V>(map: Map<K, V>, key: K, creator: (() => V)): V {
    let value = map.get(key);
    if (!value) {
        value = creator();
        map.set(key, value);
    }
    return value;
}

Map.prototype.getOrCreate = function(key, creator) { return GetOrCreate(this, key, creator); };