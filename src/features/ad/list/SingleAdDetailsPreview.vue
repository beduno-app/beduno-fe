<template>
  <div class="row justify-content-center advertisement-section py-5">
    <single-full-ad :advertisementData="advertisementData" />
    <!-- todo: extract actions to separate component and reuse -->
    <div class="p-3 container">
      <div class="row">
        <div class="col-md-4 col-sm-6 col-sx-12">
          <div
            class="d-flex align-items-center cursor-pointer"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <img
              src="../../../assets/img/icon_preview.png"
              style="width: 40px; height: 40px"
              class="mx-2"
              alt="icon_preview"
            />
            <div class="pt-2 w-500">
              <span class="btn-text m-0 label">{{
                $t("advertisementView.actions.edit.label")
              }}</span>
              <p class="text-small">
                {{ $t("advertisementView.actions.edit.tip") }}
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-sm-6 col-sx-12">
          <div class="d-flex align-items-center cursor-pointer">
            <img
              src="../../../assets/img/icon_save.png"
              style="width: 40px; height: 40px"
              class="mx-2"
              alt="icon_save"
            />
            <div class="pt-2 w-500">
              <span class="btn-text m-0 label">{{
                $t("advertisementView.actions.save.label")
              }}</span>
              <p class="text-small">
                {{ $t("advertisementView.actions.save.tip") }}
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-sm-6 col-sx-12">
          <!-- todo: handle action button -->
          <div class="d-flex align-items-center cursor-pointer">
            <img
              src="../../../assets/img/icon_post_advertisement.png"
              style="width: 40px; height: 40px"
              class="mx-2"
              alt="icon_save"
            />
            <div class="pt-2 w-500">
              <span class="btn-text m-0 label">{{
                $t("advertisementView.actions.publish.label")
              }}</span>
              <p class="text-small">
                {{ $t("advertisementView.actions.publish.tip") }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" scoped>
import { Options, Vue } from "vue-class-component";
import Header from "../details/Header.vue";
import Subheader from "../details/Subheader.vue";
import Gallery from "../details/Gallery.vue";
import Host from "../details/Host.vue";
import Equipments from "../details/Equipments.vue";
import SharedEquipments from "../details/SharedEquipments.vue";
import Rules from "../details/Rules.vue";
import Payments from "../details/Payments.vue";
import DescriptionWithMap from "../details/DescriptionWithMap.vue";
import Tenant from "../details/Tenant.vue";
import SingleFullAd from "./SingleFullAd.vue";

@Options({
  components: {
    Header,
    Subheader,
    Gallery,
    Host,
    Equipments,
    SharedEquipments,
    Rules,
    Payments,
    DescriptionWithMap,
    Tenant,
    SingleFullAd,
  },
  props: {
    advertisementData: Object,
    default: {},
  },
})
export default class SingleAdDetailsPreview extends Vue {}
</script>

<style lang="scss">
@import "@/assets/_variables.scss";
@import "@/assets/style.scss";
.advertisement-section {
  font-size: 0.9rem;
  max-width: 1400px;
  font-weight: 500;
  margin: auto;
}
</style>
