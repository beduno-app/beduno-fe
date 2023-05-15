<template>
  <div style="max-width: 900px" class="container-fluid p-4">
    <ul class="list-unstyled" style="font-size: 1.2rem">
      <li class="green-dot my-4">{{ $t("becomeHostView.list.item1") }}</li>
      <li class="green-dot my-4">
        {{ $t("becomeHostView.list.item2") }}
      </li>
      <li class="green-dot my-4">
       {{ $t("becomeHostView.list.item3") }}
      </li>
      <li class="green-dot my-4">{{ $t("becomeHostView.list.item4") }}</li>
    </ul>
    <div class="d-flex justify-content-end">
      <button class="add-advertisement">{{ $t("becomeHostView.action.add") }}</button>
    </div>
    <div class="d-flex justify-content-end green-text">
     {{ $t("becomeHostView.action.hint") }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/_variables.scss";
.green-dot {
  display: flex;
  align-items: center;
  display: flow-root;
}
.green-dot::before {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: $success-color;
  border-radius: 50%;
  margin-right: 8px;
}
.green-text {
  color: $success-color;
}
.add-advertisement {
  border-radius: 10px;
  padding: 5px 15px;
  background: $success-color;
  border: 1px solid $success-color;
  color: white;
}
</style>
