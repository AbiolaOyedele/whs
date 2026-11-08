import { Mesh, Points, type Material, type Object3D } from 'three'

/** Frees every geometry and material under `root` (each once). */
export function disposeTree(root: Object3D): void {
  const materials = new Set<Material>()
  root.traverse((object) => {
    if (object instanceof Mesh || object instanceof Points) {
      object.geometry.dispose()
      const material: Material | Material[] = object.material
      if (Array.isArray(material)) material.forEach((item) => materials.add(item))
      else materials.add(material)
    }
  })
  materials.forEach((material) => material.dispose())
}
