// Flattens a JSON:API document into plain objects: { id, ...attributes } for one resource or a list.
// The API sends no relationships or included resources.
export function deserialize(document) {
  return Array.isArray(document.data) ? document.data.map(flatten) : flatten(document.data);
}

function flatten(resource) {
  return { id: resource.id, ...resource.attributes };
}
