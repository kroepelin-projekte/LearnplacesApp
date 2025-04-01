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
    };
    blocks: Array<BlockInterface>;
  }

  interface TokenResponseInterface {
    data: {
      success: boolean;
      access_token: string;
    }
  }
}

export {};
