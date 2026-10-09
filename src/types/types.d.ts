declare global {
  interface BlockInterface {
    id: number;
    type: string;
    title: string;
    description: string;
    content: string;
    link: string;
    picture: string;
    video: string;
    accordion: Array<string>;
    order: number;
    visible: string;
    visited: boolean;
    ilias_obj_url: string;
    ilias_obj_title: string;
    expand: boolean;
    sub_blocks: Array<BlockInterface>;
    resource_id: number;
  }

  interface LearnplaceInterface {
    id: number;
    title: string;
    description: string;
    location: {
      latitude: number;
      longitude: number;
      radius: number;
      zoom: number;
    };
    tags: Array<string>;
    visited: boolean;
    blocks: Array<BlockInterface>;
    content_size: string;
    downloaded?: boolean;
  }

  interface CachedContainer {
    title: string;
    learnplaces: LearnplaceInterface[];
  }

  interface ContainerInterface {
    title: string;
    learnplaces_numbers: number;
    ref_id: number;
    tags: Array<string>;
  }

  interface VerifyTokenResponse {
    id: number;
    status: string;
    title: string;
    latitude: number;
    longitude: number;
    radius: number;
  }

  interface ApiResponse {
    data: VerifyTokenResponse;
  }

  interface NetworkInformation extends EventTarget {
    type?: 'wifi' | 'cellular' | 'ethernet' | 'none' | 'unknown';
    downlink?: number; // Speed in Mbps
    effectiveType?: string; // e.g. '4g', '3g'
    rtt?: number; // Round Trip Time in ms
    saveData?: boolean; // Data saving mode?
  }

  interface TourLearnplace {
    id: number;
    latitude: number;
    longitude: number;
    radius: number;
    title: string;
    visited: boolean;
  }

  interface Tour {
    map_id: number;
    context_ref_id: number;
    title: string;
    description: string;
    tour_learnplaces: TourLearnplace[];
  }

  interface CollectionLearnplace {
    id: number;
    latitude: number;
    longitude: number;
    radius: number;
    title: string;
    visited: boolean;
    color: string;
    tag_name: string;
    render_index: number;
  }

  interface Collection {
    map_id: number;
    title: string;
    description: string;
    context_ref_id: number;
    collection_learnplaces: CollectionLearnplace[]
  }
}

export {};
