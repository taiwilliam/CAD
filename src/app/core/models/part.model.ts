export interface Part {
  id: number;
  part_number: string;
  part_name: string;
  category_id: number;
  material: string;
  status: number;
  revision: string;
  updated_at: string;
  owner: string;
  tolerance: string;
  cad_file_url: string;
  model_file_url: string;
  description: string;
  standard: string;
  specification: string;
  project_code: string;
  drawing_number: string;
}
