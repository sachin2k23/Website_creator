// Find node
export function findNode(tree, id) {
  for (const node of tree) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

// Update node
export function updateNode(tree, id, changes) {
  return tree.map(node => {
    if (node.id === id) return { ...node, ...changes }

    if (node.children?.length) {
      return {
        ...node,
        children: updateNode(node.children, id, changes)
      }
    }

    return node
  })
}

// Delete node
export function deleteNode(tree, id) {
  return tree
    .filter(node => node.id !== id)
    .map(node => ({
      ...node,
      children: node.children?.length
        ? deleteNode(node.children, id)
        : []
    }))
}